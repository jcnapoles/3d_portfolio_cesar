// Blog page templates: plain HTML strings, rendered at build time (and per request in dev).
// Static-first: every page is complete HTML (SEO, no-JS readers, RSS readers); src/blog/main.js only adds
// small enhancements (scrolled nav, mobile menu, reading progress, copy link).
// Tailwind scans this file (tailwind.config.cjs `content`), so utility classes here are generated.
import { CATEGORIES } from "./content.mjs";
import { SITE_URL, PERSON, LINKS, calendlyUrl } from "../../src/constants/site.js";

export const BLOG_PATH = "/blog/";
export const RSS_PATH = "/blog/rss.xml";
const BLOG_TITLE = "Mission Log";
const BLOG_DESCRIPTION =
  "Cesar Napoles' blog: notes from the CTO seat, product launches and a Fractional CTO's take on tech news.";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const postPath = (p) => `${BLOG_PATH}${p.slug}/`;
export const categoryPath = (key) => `${BLOG_PATH}category/${key}/`;
const abs = (p) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);

const fmtDate = (iso) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

// Category accent: CTO Log gold, Launches signal green, Signals ion blue.
const TONE = {
  "cto-log": { text: "text-gold", dot: "bg-gold" },
  launch: { text: "text-signal", dot: "bg-signal" },
  signal: { text: "text-ion", dot: "bg-ion" },
};

const STAR = (size = 12, cls = "") =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" class="shrink-0 ${cls}" aria-hidden="true" focusable="false"><path d="M12 .5 L13 11 L23.5 12 L13 13 L12 23.5 L11 13 L.5 12 L11 11 Z"/><path opacity=".6" d="M9 9 L12 11.3 L15 9 L12.7 12 L15 15 L12 12.7 L9 15 L11.3 12 Z"/><circle cx="12" cy="12" r="1.8"/></svg>`;
const ARROW_UR = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>`;
const ARROW_L = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;
const RSS_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`;

const LOGO = `<span class="inline-flex items-center gap-2.5">${STAR(18, "text-gold")}<span class="flex flex-col"><span class="whitespace-nowrap text-[15px] font-semibold leading-[1.1] tracking-[-0.01em] text-ink-1">Cesar Napoles</span><span class="mt-1 whitespace-nowrap font-mono text-hud-xs uppercase leading-none text-ink-3">Fractional CTO</span></span></span>`;

const BTN_PRIMARY =
  "btn-glow group relative isolate inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-gold px-6 text-button text-void shadow-glow-cta stretch-105 transition-colors duration-ui ease-ui hover:bg-gold-hot";
const BTN_GHOST =
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-line-strong bg-white/[.04] px-5 text-small font-medium text-ink-1 transition-colors duration-ui ease-ui hover:border-ink-3 hover:bg-white/[.07]";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#results", label: "Results" },
  { href: "/#about", label: "About" },
  { href: BLOG_PATH, label: "Blog", blog: true },
  { href: "/#contact", label: "Contact" },
];

/* ---------- Chrome ---------- */

function header() {
  const links = NAV.map(
    (l) =>
      `<li><a href="${l.href}"${l.blog ? ' aria-current="true"' : ""} class="relative flex h-10 items-center rounded-pill px-3.5 text-small transition-colors duration-ui ease-ui ${l.blog ? "text-ink-1" : "text-ink-2 hover:text-ink-1"}">${l.label}<span aria-hidden="true" class="nav-dot absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_6px_rgba(244,184,96,.8)]"></span></a></li>`
  ).join("");
  const menuLinks = NAV.map(
    (l, i) =>
      `<li class="border-b border-line"><a href="${l.href}"${l.blog ? ' aria-current="true"' : ""} class="flex items-center gap-5 py-[18px]"><span aria-hidden="true" class="hud-label w-6 shrink-0 tabular">${String(i + 1).padStart(2, "0")}</span><span class="text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] stretch-110 ${l.blog ? "text-ink-1" : "text-ink-1/[.86]"}">${l.label}</span>${l.blog ? STAR(12, "ml-auto text-gold") : ""}</a></li>`
  ).join("");

  return `<header data-blog-nav data-scrolled="false" class="nav-shell pointer-events-none fixed inset-x-0 top-0 z-nav md:pt-4">
  <div class="nav-frame">
    <span aria-hidden="true" class="nav-surface"></span>
    <a href="/" aria-label="Cesar Napoles, Fractional CTO: home" class="relative -my-1 shrink-0 rounded-sm py-1">${LOGO}</a>
    <nav aria-label="Primary" class="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"><ul class="flex items-center">${links}</ul></nav>
    <div class="relative flex shrink-0 items-center gap-1 md:gap-1.5">
      <a href="${calendlyUrl("blog")}" target="_blank" rel="noopener noreferrer" class="${BTN_PRIMARY} max-md:px-4"><span class="md:hidden">Book</span><span class="hidden md:inline">Book a call</span><span class="sr-only"> (opens Calendly in a new tab)</span></a>
      <button type="button" data-menu-open aria-controls="blog-menu" aria-label="Open menu" class="inline-flex size-11 items-center justify-center rounded-pill text-ink-1 transition-colors duration-ui ease-ui hover:bg-white/[.06] lg:hidden">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <span aria-hidden="true" class="nav-progress"><span class="nav-progress-line" data-read-progress style="transform:scaleX(0)"></span></span>
  </div>
</header>
<dialog id="blog-menu" aria-label="Menu" class="blog-menu">
  <div class="nav-frame">
    <a href="/" aria-label="Cesar Napoles, Fractional CTO: home" class="relative -my-1 shrink-0 rounded-sm py-1">${LOGO}</a>
    <button type="button" data-menu-close aria-label="Close menu" class="inline-flex size-11 items-center justify-center rounded-pill text-ink-1 hover:bg-white/[.06]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <nav aria-label="Menu" class="mx-auto w-full max-w-[1120px] px-4 pt-8 md:px-9"><ul class="border-t border-line">${menuLinks}</ul>
    <a href="${calendlyUrl("menu")}" target="_blank" rel="noopener noreferrer" class="${BTN_PRIMARY} mt-10 h-14 w-full">Book a 30-min call<span class="sr-only"> (opens Calendly in a new tab)</span></a>
  </nav>
</dialog>`;
}

function footer() {
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-8 items-center gap-2 text-ink-2 transition-colors duration-ui ease-ui hover:text-ink-1 coarse:min-h-11";
  return `<footer class="relative z-content mt-24 border-t border-line pb-12 pt-14">
  <div class="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-10">
    <div class="flex items-center gap-4" aria-hidden="true"><span class="h-px flex-1 bg-line-strong"></span><span class="hud-label">END OF TRANSMISSION</span><span class="h-px flex-1 bg-line-strong"></span></div>
    <div class="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div>
        <a href="/" class="inline-block rounded-sm">${LOGO}</a>
        <p class="mt-4 max-w-[44ch] text-small text-ink-2">Fractional CTO for startups and SMEs. Strategy, architecture and teams that ship.</p>
      </div>
      <ul class="flex flex-wrap gap-x-6 gap-y-1 text-small">
        <li><a class="${link}" href="/">Home</a></li>
        <li><a class="${link}" href="${BLOG_PATH}">Blog</a></li>
        <li><a class="${link}" href="${RSS_PATH}">${RSS_ICON}RSS</a></li>
        <li><a class="${link}" href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a class="${link}" href="${LINKS.github}" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
    </div>
    <p class="mt-10 font-mono text-hud-xs uppercase text-ink-3">&copy; ${year} ${esc(PERSON.name)} &middot; ${esc(PERSON.location)}</p>
  </div>
</footer>`;
}

/* ---------- Document ---------- */

/**
 * Full HTML document. `assets` are the <script>/<link> tags of the blog entry (src/blog/main.js):
 * the dev server passes the source script, the build passes the hashed tags Vite produced.
 */
export function layout({ title, description, path, lang = "en", type = "website", image, jsonLd, extraHead = "", body, assets }) {
  const url = abs(path);
  const og = abs(image || "/og-image.png");
  return `<!DOCTYPE html>
<html lang="${lang}" data-page="blog">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <script>
      (function () {
        var d = document.documentElement, pref = null;
        try { pref = localStorage.getItem('cn:motion'); } catch (e) {}
        var reduced = pref ? pref === 'reduced' : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
        d.dataset.motion = reduced ? 'reduced' : 'full';
        d.dataset.pointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches ? 'fine' : 'coarse';
      })();
    </script>
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#05060A" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="alternate" type="application/rss+xml" title="${esc(PERSON.name)}: ${BLOG_TITLE}" href="${abs(RSS_PATH)}" />
    <link rel="preload" href="/fonts/mona-sans-latin-standard.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/geist-mono-latin-wght.woff2" as="font" type="font/woff2" crossorigin />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="${esc(PERSON.name)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${og}" />
    <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${og}" />
    ${extraHead}
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
    ${assets}
  </head>
  <body>
    <a href="#main" class="blog-skip">Skip to content</a>
    <div aria-hidden="true" class="blog-sky"></div>
    ${header()}
    <main id="main" tabindex="-1" class="relative z-content pt-28 md:pt-36">
${body}
    </main>
    ${footer()}
  </body>
</html>`;
}

/* ---------- Pieces ---------- */

function meta(p, { withCategory = true } = {}) {
  const c = CATEGORIES[p.category];
  const t = TONE[p.category];
  const bits = [];
  if (withCategory) bits.push(`<a href="${categoryPath(p.category)}" class="inline-flex items-center gap-2 ${t.text} hover:underline"><span aria-hidden="true" class="size-1.5 rounded-full ${t.dot}"></span>${esc(c.label)}</a>`);
  bits.push(`<time datetime="${p.date}">${fmtDate(p.date)}</time>`);
  bits.push(`<span>${p.readingMinutes} min read</span>`);
  if (p.lang !== "en") bits.push(`<span class="rounded-xs border border-line-strong px-1.5 py-0.5 text-ink-2" title="Written in ${p.lang === "es" ? "Spanish" : p.lang}">${p.lang.toUpperCase()}</span>`);
  if (p.draft) bits.push(`<span class="rounded-xs bg-danger/15 px-1.5 py-0.5 text-danger">DRAFT</span>`);
  if (p.scheduled) bits.push(`<span class="rounded-xs bg-ion/15 px-1.5 py-0.5 text-ion">SCHEDULED</span>`);
  return `<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-hud-xs uppercase text-ink-3">${bits.join('<span aria-hidden="true" class="text-ink-3/50">/</span>')}</div>`;
}

const tagList = (tags) =>
  tags.length
    ? `<ul class="flex flex-wrap gap-2" aria-label="Tags">${tags.map((t) => `<li class="rounded-sm border border-line bg-space-600/60 px-2.5 py-1 font-mono text-[12px] leading-[1.4] text-ink-2">#${esc(t)}</li>`).join("")}</ul>`
    : "";

function card(p, { featured = false } = {}) {
  const lang = p.lang !== "en" ? ` lang="${p.lang}"` : "";
  return `<article class="blog-card card-k1 group relative flex flex-col p-6 md:p-8 ${featured ? "lg:col-span-2 lg:p-10" : ""}"${lang}>
  ${meta(p)}
  <h${featured ? 2 : 3} class="mt-4 ${featured ? "text-h3 md:text-[2.5rem] md:leading-[1.08]" : "text-h4 md:text-[1.5rem] md:leading-[1.2]"} font-semibold tracking-[-0.02em] text-ink-1">
    <a href="${postPath(p)}" class="blog-card-link">${esc(p.title)}</a>
  </h${featured ? 2 : 3}>
  <p class="mt-3 ${featured ? "max-w-[62ch] text-lead" : "text-body"} text-ink-2">${esc(p.summary)}</p>
  ${p.tags.length ? `<div class="mt-6">${tagList(p.tags.slice(0, 4))}</div>` : ""}
  <span aria-hidden="true" class="mt-auto inline-flex items-center gap-1.5 pt-6 text-small font-medium text-ink-1">Read ${featured ? "the post" : ""}<span class="transition-transform duration-ui ease-ui motion-ok:group-hover:translate-x-1">&rarr;</span></span>
</article>`;
}

function categoryTabs(active) {
  const tabs = [{ key: null, label: "All", href: BLOG_PATH }, ...Object.entries(CATEGORIES).map(([key, c]) => ({ key, label: c.label, href: categoryPath(key) }))];
  return `<nav aria-label="Categories" class="mt-10 -mx-4 overflow-x-auto px-4 [scrollbar-width:none]"><ul class="flex w-max gap-2">${tabs
    .map((t) => {
      const on = t.key === active;
      return `<li><a href="${t.href}"${on ? ' aria-current="page"' : ""} class="inline-flex h-10 items-center rounded-pill border px-4 text-small transition-colors duration-ui ease-ui ${on ? "border-gold/50 bg-[var(--gold-tint)] text-gold-hot" : "border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink-1"}">${esc(t.label)}</a></li>`;
    })
    .join("")}</ul></nav>`;
}

function hudRow(left, right = "") {
  return `<div class="flex items-center gap-3 font-mono text-hud-xs uppercase text-ink-3" aria-hidden="true">${STAR(10, "text-gold")}<span>${left}</span><span class="h-px flex-1 bg-line"></span>${right ? `<span>${right}</span>` : ""}</div>`;
}

const container = (inner, size = "max-w-container") => `<div class="mx-auto w-full ${size} px-4 sm:px-6 lg:px-10">${inner}</div>`;

/* ---------- Pages ---------- */

/** Blog index (category = null) and category pages. */
export function listPage({ posts, category = null, assets }) {
  const c = category ? CATEGORIES[category] : null;
  const list = category ? posts.filter((p) => p.category === category) : posts;
  const featured = !category ? list.find((p) => p.featured) || list[0] : null;
  const rest = featured ? list.filter((p) => p !== featured) : list;

  const title = c ? c.label : BLOG_TITLE;
  const lead = c
    ? c.description
    : "Notes from the CTO seat, the products I launch, and my take on the tech news that matters to startups and SMEs.";

  const grid = list.length
    ? `<div class="mt-12 grid gap-5 md:grid-cols-2 lg:gap-6">${featured ? card(featured, { featured: true }) : ""}${rest.map((p) => card(p)).join("")}</div>`
    : `<div class="panel-blueprint mt-12 flex flex-col items-center px-6 py-20 text-center">
        ${STAR(22, "text-gold")}
        <p class="mt-5 font-mono text-hud uppercase text-ink-3">Awaiting first transmission</p>
        <p class="mt-3 max-w-[44ch] text-body text-ink-2">The first ${c ? esc(c.label.toLowerCase()) + " post" : "post"} is on its way. Follow the <a class="link-ion" href="${RSS_PATH}">RSS feed</a> or <a class="link-ion" href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a> to catch it.</p>
      </div>`;

  const body = container(`
    ${hudRow(c ? `BLOG / ${c.hud}` : "BLOG / MISSION LOG", `${list.length} ${list.length === 1 ? "ENTRY" : "ENTRIES"}`)}
    <h1 class="mt-6 text-display-l stretch-110 text-ink-1">${esc(title)}</h1>
    <p class="mt-6 max-w-measure text-lead text-ink-2">${esc(lead)}</p>
    <p class="mt-5"><a href="${RSS_PATH}" class="inline-flex items-center gap-2 font-mono text-hud-xs uppercase text-ink-3 transition-colors hover:text-ink-1">${RSS_ICON}Subscribe via RSS</a></p>
    ${categoryTabs(category)}
    ${grid}
  `);

  const path = c ? categoryPath(category) : BLOG_PATH;
  return layout({
    title: c ? `${c.label} | Blog | ${PERSON.name}` : `Blog | ${PERSON.name}, ${PERSON.role}`,
    description: c ? c.description : BLOG_DESCRIPTION,
    path,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${SITE_URL}${BLOG_PATH}#blog`,
      url: abs(path),
      name: `${PERSON.name}: ${BLOG_TITLE}`,
      description: BLOG_DESCRIPTION,
      author: { "@id": `${SITE_URL}/#person` },
      blogPost: list.slice(0, 20).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: abs(postPath(p)), datePublished: p.date })),
    },
    body,
    assets,
  });
}

/** One post. `prev` is the older neighbour, `next` the newer one (same list order as the index). */
export function postPage({ post: p, prev, next, assets }) {
  const c = CATEGORIES[p.category];
  const url = abs(postPath(p));

  const source = p.source
    ? `<aside class="panel-blueprint mt-10 p-5 md:p-6" aria-label="Source">
        <p class="font-mono text-hud-xs uppercase text-ion">Commenting on</p>
        <a href="${esc(p.source.url)}" target="_blank" rel="noopener noreferrer" class="group mt-2 flex items-start justify-between gap-4 text-body font-medium text-ink-1">
          <span>${esc(p.source.title)}${p.source.publisher ? `<span class="block text-small font-normal text-ink-3">${esc(p.source.publisher)}</span>` : ""}</span>
          <span class="mt-1 text-ink-2 transition-transform duration-ui ease-ui group-hover:text-ink-1 motion-ok:group-hover:-translate-y-0.5 motion-ok:group-hover:translate-x-0.5">${ARROW_UR}</span>
        </a>
      </aside>`
    : "";

  const product = p.product
    ? `<aside class="card-k1 mt-14 overflow-hidden p-6 md:p-8" aria-label="${esc(p.product.name)}">
        <p class="font-mono text-hud-xs uppercase text-signal">Featured product</p>
        <p class="mt-3 text-h4 text-ink-1">${esc(p.product.name)}</p>
        ${p.product.pitch ? `<p class="mt-2 max-w-[56ch] text-body text-ink-2">${esc(p.product.pitch)}</p>` : ""}
        <a href="${esc(p.product.url)}?utm_source=cesarnapoles.com&amp;utm_medium=blog&amp;utm_campaign=${esc(p.slug)}" target="_blank" rel="noopener" class="${BTN_PRIMARY} mt-6 h-12">${esc(p.product.cta)}${ARROW_UR}<span class="sr-only"> (opens in a new tab)</span></a>
      </aside>`
    : "";

  const toc = p.toc.length
    ? `<details class="blog-toc mt-10 rounded-md border border-line px-5 py-4" open>
        <summary class="font-mono text-hud-xs uppercase text-ink-3">On this page</summary>
        <ol class="mt-3 space-y-1.5 text-small">${p.toc.map((h) => `<li class="${h.depth === 3 ? "pl-4" : ""}"><a class="text-ink-2 hover:text-ink-1" href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>
      </details>`
    : "";

  const neighbour = (q, label, align) =>
    q
      ? `<a href="${postPath(q)}" class="card-k1 group flex flex-col p-5 ${align}"><span class="font-mono text-hud-xs uppercase text-ink-3">${label}</span><span class="mt-2 text-body font-medium text-ink-1 group-hover:underline">${esc(q.title)}</span></a>`
      : "<span></span>";

  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const body = container(
    `
    <a href="${BLOG_PATH}" class="inline-flex min-h-10 items-center gap-2 text-small text-ink-2 transition-colors hover:text-ink-1">${ARROW_L}All posts</a>
    <article class="mt-6" ${p.lang !== "en" ? `lang="${p.lang}"` : ""}>
      <header>
        ${meta(p)}
        <h1 class="mt-5 text-[clamp(2.25rem,1.2rem+3.4vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] stretch-110 text-ink-1">${esc(p.title)}</h1>
        <p class="mt-6 text-lead text-ink-2">${esc(p.summary)}</p>
        ${p.tags.length ? `<div class="mt-6">${tagList(p.tags)}</div>` : ""}
        ${p.cover ? `<figure class="mt-10 overflow-hidden rounded-lg border border-line"><img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" width="1280" height="720" class="h-auto w-full" fetchpriority="high" /></figure>` : ""}
      </header>
      ${source}
      ${toc}
      <div class="prose-blog mt-10">
${p.html}
      </div>
      ${product}
    </article>

    <section aria-label="About the author" class="mt-16 flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center">
      <img src="/cesar.webp" alt="" width="64" height="64" class="size-16 shrink-0 rounded-full border border-line-strong object-cover" loading="lazy" />
      <div class="flex-1">
        <p class="text-body font-semibold text-ink-1">${esc(PERSON.name)}</p>
        <p class="mt-1 text-small text-ink-2">${esc(PERSON.role)} for startups and SMEs. 12+ years building and scaling software in banking, fintech, insurance and e-commerce.</p>
      </div>
      <a href="${calendlyUrl("blog-post")}" target="_blank" rel="noopener noreferrer" class="${BTN_PRIMARY} h-12 shrink-0">Book a call<span class="sr-only"> (opens Calendly in a new tab)</span></a>
    </section>

    <div class="mt-8 flex flex-wrap items-center gap-2">
      <span class="mr-2 font-mono text-hud-xs uppercase text-ink-3">Share</span>
      <a href="${shareLinkedIn}" target="_blank" rel="noopener noreferrer" class="${BTN_GHOST}">LinkedIn<span class="sr-only"> (opens in a new tab)</span></a>
      <button type="button" data-copy-link="${url}" class="${BTN_GHOST}"><span data-copy-label>Copy link</span></button>
    </div>

    <nav aria-label="More posts" class="mt-14 grid gap-4 md:grid-cols-2">
      ${neighbour(prev, "&larr; Older", "")}
      ${neighbour(next, "Newer &rarr;", "md:text-right")}
    </nav>
  `,
    "max-w-[760px]"
  );

  const image = p.cover && !p.cover.endsWith(".avif") ? p.cover : undefined;
  return layout({
    title: `${p.title} | ${PERSON.name}`,
    description: p.summary,
    path: postPath(p),
    lang: p.lang,
    type: "article",
    image,
    extraHead: [
      `<meta property="article:published_time" content="${p.date}" />`,
      p.updated ? `<meta property="article:modified_time" content="${p.updated}" />` : "",
      `<meta property="article:section" content="${esc(c.label)}" />`,
      ...p.tags.map((t) => `<meta property="article:tag" content="${esc(t)}" />`),
      p.draft || p.scheduled ? `<meta name="robots" content="noindex" />` : "",
    ]
      .filter(Boolean)
      .join("\n    "),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#post`,
      mainEntityOfPage: url,
      headline: p.title,
      description: p.summary,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      inLanguage: p.lang,
      articleSection: c.label,
      keywords: p.tags.join(", ") || undefined,
      image: abs(image || "/og-image.png"),
      author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: PERSON.name, url: `${SITE_URL}/` },
      publisher: { "@id": `${SITE_URL}/#person` },
      isPartOf: { "@id": `${SITE_URL}${BLOG_PATH}#blog` },
      ...(p.source ? { citation: p.source.url } : {}),
    },
    body,
    assets,
  });
}

/* ---------- Feeds ---------- */

export function rss(posts) {
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(postPath(p))}</link>
      <guid isPermaLink="true">${abs(postPath(p))}</guid>
      <pubDate>${new Date(`${p.date}T08:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(CATEGORIES[p.category].label)}</category>
      <description>${esc(p.summary)}</description>
      <content:encoded><![CDATA[${p.html.replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(PERSON.name)}: ${BLOG_TITLE}</title>
    <link>${abs(BLOG_PATH)}</link>
    <description>${esc(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${abs(RSS_PATH)}" rel="self" type="application/rss+xml" />
    ${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].date}T08:00:00Z`).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;
}

export function sitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today },
    { loc: abs(BLOG_PATH), lastmod: posts[0]?.date || today },
    ...Object.keys(CATEGORIES).map((k) => ({ loc: abs(categoryPath(k)), lastmod: posts.find((p) => p.category === k)?.date || today })),
    ...posts.map((p) => ({ loc: abs(postPath(p)), lastmod: p.updated || p.date })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
}
