// Vite plugin: static blog generation.
//
//   content/blog/*.md ──(content.mjs: validate + Markdown)──> posts ──(templates.mjs)──> HTML pages
//
// - Dev: a middleware renders /blog/... on every request (content edits show on reload; the page reloads
//   itself when a .md file changes). Drafts and future-dated posts are visible, flagged DRAFT / SCHEDULED.
// - Build: blog.html is a Rollup entry only so Vite bundles src/blog/main.js (+ CSS). Its hashed <script>/<link>
//   tags are reused in every generated page and the shell itself is dropped from the output. Emits
//   per language (en under blog/, es under es/blog/): index.html, <slug>/index.html, category|categoria/<key>/index.html,
//   rss.xml; plus sitemap.xml (home pages, blog pages and posts in both languages).
import path from "node:path";
import { CATEGORIES, CONTENT_DIR, loadPosts } from "./content.mjs";
import { listPage, postPage, rss, sitemap } from "./templates.mjs";

const SHELL = "blog.html";
const DEV_ASSETS = '<script type="module" src="/src/blog/main.js"></script>';

/**
 * Maps a URL path to a generated document, or null when it is not a blog route.
 * English: /blog/..., /blog/category/<key>/   Spanish: /es/blog/..., /es/blog/categoria/<key>/
 */
function render(urlPath, posts, assets) {
  const p = urlPath.replace(/\/index\.html$/, "/");
  if (p === "/sitemap.xml") return { type: "application/xml", body: sitemap(posts) };

  const m = p.match(/^(\/es)?\/blog(\/.*)?$/);
  if (!m) return null;
  const lang = m[1] ? "es" : "en";
  const rest = (m[2] || "/").replace(/\/?$/, "/");

  if (rest === "/rss.xml/") return { type: "application/rss+xml", body: rss(posts, lang) };
  if (rest === "/") return { type: "text/html", body: listPage({ posts, lang, assets }) };

  const cat = rest.match(lang === "es" ? /^\/categoria\/([a-z0-9-]+)\/$/ : /^\/category\/([a-z0-9-]+)\/$/);
  if (cat) return CATEGORIES[cat[1]] ? { type: "text/html", body: listPage({ posts, lang, category: cat[1], assets }) } : null;

  const post = rest.match(/^\/([a-z0-9-]+)\/$/);
  if (post) {
    const same = posts.filter((x) => x.lang === lang);
    const i = same.findIndex((x) => x.slug === post[1]);
    if (i === -1) return null;
    return { type: "text/html", body: postPage({ post: same[i], prev: same[i + 1], next: same[i - 1], assets }) };
  }
  return null;
}

export default function blogPlugin() {
  return {
    name: "cn-blog",
    enforce: "post",

    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      const reload = (file) => {
        if (path.resolve(file).startsWith(CONTENT_DIR)) server.ws.send({ type: "full-reload", path: "*" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("change", reload);
      server.watcher.on("unlink", reload);

      // Registered directly (not returned), so it runs before Vite's own HTML / SPA-fallback middlewares.
      server.middlewares.use(async (req, res, next) => {
        const urlPath = decodeURIComponent((req.url || "").split("?")[0]);
        if (!/^(\/es)?\/blog(\/|$)/.test(urlPath) && urlPath !== "/sitemap.xml") return next();
        try {
          const out = render(urlPath, loadPosts({ includeDrafts: true }), DEV_ASSETS);
          if (!out) return next();
          const body = out.type === "text/html" ? await server.transformIndexHtml(req.url, out.body) : out.body;
          res.statusCode = 200;
          res.setHeader("Content-Type", `${out.type}; charset=utf-8`);
          res.end(body);
        } catch (error) {
          // Frontmatter errors: show them in the browser instead of a blank page.
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(String(error?.message || error));
        }
      });
    },

    generateBundle(_options, bundle) {
      const shell = bundle[SHELL];
      if (!shell) return;
      const html = String(shell.source);
      const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
      const assets = (head.match(/<script type="module"[^>]*><\/script>|<link rel="(?:stylesheet|modulepreload)"[^>]*>/g) || []).join("\n    ");
      delete bundle[SHELL];

      // Netlify deploy previews (and BLOG_DRAFTS=1) include drafts, flagged and noindex, so a PR can be proofread
      // at its preview URL. Production builds never do.
      const includeDrafts = process.env.BLOG_DRAFTS === "1" || process.env.CONTEXT === "deploy-preview";
      const posts = loadPosts({ includeDrafts });
      const emit = (fileName, urlPath) => {
        const out = render(urlPath, posts, assets);
        this.emitFile({ type: "asset", fileName, source: out.body });
      };

      emit("sitemap.xml", "/sitemap.xml");
      for (const lang of ["en", "es"]) {
        const base = lang === "es" ? "es/blog" : "blog";
        const catSeg = lang === "es" ? "categoria" : "category";
        emit(`${base}/index.html`, `/${base}/`);
        emit(`${base}/rss.xml`, `/${base}/rss.xml`);
        for (const key of Object.keys(CATEGORIES)) emit(`${base}/${catSeg}/${key}/index.html`, `/${base}/${catSeg}/${key}/`);
        for (const p of posts.filter((x) => x.lang === lang)) emit(`${base}/${p.slug}/index.html`, `/${base}/${p.slug}/`);
      }

      this.info?.(`blog: ${posts.length} post(s) published`);
    },
  };
}
