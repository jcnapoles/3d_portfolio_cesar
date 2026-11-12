// Blog content layer: reads content/blog/*.md, validates the frontmatter, renders Markdown to HTML.
// Runs in Node only (Vite plugin, build time). Nothing here ships to the browser.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";

export const CONTENT_DIR = path.resolve("content/blog");

/**
 * The three editorial lines of the blog. `key` is the frontmatter value and the URL segment
 * (/blog/category/<key>/). Keep the list short: categories are navigation, tags are for detail.
 */
export const CATEGORIES = {
  "cto-log": {
    label: "CTO Log",
    hud: "FIELD NOTES",
    description: "What happens in the CTO seat: decisions, trade-offs, teams, incidents and lessons learned.",
  },
  launch: {
    label: "Launches",
    hud: "PRODUCT LAUNCHES",
    description: "Products I build or lead: launches, new features and why they exist.",
  },
  signal: {
    label: "Signals",
    hud: "INCOMING SIGNALS",
    description: "Tech and industry news, with a CTO's take on what it means for startups and SMEs.",
  },
};

const LANGS = ["en", "es"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 220;

const slugify = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** gray-matter parses unquoted YAML dates as Date objects; normalise to YYYY-MM-DD. */
const toIsoDay = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? v : String(v));

/** Markdown renderer: heading anchors (for the table of contents), safe external links, lazy images. */
function createRenderer(toc) {
  const marked = new Marked({ gfm: true });
  const seen = new Map();
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, "");
        let id = slugify(plain) || "section";
        const n = seen.get(id) || 0;
        seen.set(id, n + 1);
        if (n) id = `${id}-${n}`;
        if (depth === 2 || depth === 3) toc.push({ id, text: plain, depth });
        // h1 is the post title: demote any h1 in the body to h2.
        const level = Math.max(2, depth);
        return `<h${level} id="${id}"><a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${text}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith("https://cesarnapoles.com");
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        const ext = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeHtml(href)}"${t}${ext}>${text}</a>`;
      },
      image({ href, title, text }) {
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${t} loading="lazy" decoding="async" />`;
        return title ? `<figure>${img}<figcaption>${escapeHtml(title)}</figcaption></figure>` : img;
      },
    },
  });
  return marked;
}

function fail(file, message) {
  throw new Error(`[blog] ${path.relative(process.cwd(), file)}: ${message}`);
}

/** Validates one file's frontmatter and returns a normalised post object (with rendered HTML). */
function parsePost(file) {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  const date = toIsoDay(data.date);
  const updated = toIsoDay(data.updated);
  if (!data.title) fail(file, "missing `title`");
  if (!date || !DATE_RE.test(date)) fail(file, "`date` must be YYYY-MM-DD");
  if (updated && !DATE_RE.test(updated)) fail(file, "`updated` must be YYYY-MM-DD");
  if (!CATEGORIES[data.category]) fail(file, `\`category\` must be one of: ${Object.keys(CATEGORIES).join(", ")}`);
  if (!data.summary) fail(file, "missing `summary` (1-2 sentences, used in cards, meta description and RSS)");

  const lang = data.lang || "en";
  if (!LANGS.includes(lang)) fail(file, `\`lang\` must be one of: ${LANGS.join(", ")}`);

  // Slug: frontmatter `slug`, else the file name without an optional leading YYYY-MM-DD- prefix.
  const base = path.basename(file, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const slug = data.slug || slugify(base);
  if (!SLUG_RE.test(slug)) fail(file, `invalid slug "${slug}" (lowercase letters, digits and dashes)`);

  // Category-specific blocks.
  let product = null;
  if (data.product) {
    if (!data.product.name || !data.product.url) fail(file, "`product` needs `name` and `url`");
    product = { name: data.product.name, url: data.product.url, cta: data.product.cta || `Try ${data.product.name}`, pitch: data.product.pitch || "" };
  } else if (data.category === "launch") {
    fail(file, "a `launch` post needs a `product` block (name, url, optional cta / pitch)");
  }
  let source = null;
  if (data.source) {
    if (!data.source.url) fail(file, "`source` needs `url`");
    source = { url: data.source.url, title: data.source.title || data.source.url, publisher: data.source.publisher || "" };
  } else if (data.category === "signal") {
    fail(file, "a `signal` post needs a `source` block (url, title, publisher): always credit the news you comment on");
  }

  const toc = [];
  const html = createRenderer(toc).parse(content);
  const words = content.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: String(data.title),
    summary: String(data.summary).trim(),
    date,
    updated: updated || null,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    lang,
    cover: data.cover || null,
    coverAlt: data.coverAlt || "",
    featured: Boolean(data.featured),
    draft: Boolean(data.draft),
    product,
    source,
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    toc: toc.length >= 3 ? toc : [],
    html,
    file: path.relative(process.cwd(), file),
  };
}

/**
 * All posts, newest first.
 * - Files whose name starts with "_" (templates) and README.md are ignored.
 * - In production (`includeDrafts: false`) drafts and future-dated posts are left out, so publishing is
 *   "set draft: false and merge"; a future date publishes on the first deploy on or after that day.
 */
export function loadPosts({ includeDrafts = false, today = new Date().toISOString().slice(0, 10) } = {}) {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f.toLowerCase() !== "readme.md")
    .map((f) => path.join(CONTENT_DIR, f));

  const posts = files.map(parsePost);
  const slugs = new Map();
  for (const p of posts) {
    if (slugs.has(p.slug)) throw new Error(`[blog] duplicate slug "${p.slug}" in ${slugs.get(p.slug)} and ${p.file}`);
    slugs.set(p.slug, p.file);
  }

  return posts
    .map((p) => ({ ...p, scheduled: p.date > today }))
    .filter((p) => includeDrafts || (!p.draft && !p.scheduled))
    .sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : a.date < b.date ? 1 : -1));
}
