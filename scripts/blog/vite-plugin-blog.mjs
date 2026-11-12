// Vite plugin: static blog generation.
//
//   content/blog/*.md ──(content.mjs: validate + Markdown)──> posts ──(templates.mjs)──> HTML pages
//
// - Dev: a middleware renders /blog/... on every request (content edits show on reload; the page reloads
//   itself when a .md file changes). Drafts and future-dated posts are visible, flagged DRAFT / SCHEDULED.
// - Build: blog.html is a Rollup entry only so Vite bundles src/blog/main.js (+ CSS). Its hashed <script>/<link>
//   tags are reused in every generated page and the shell itself is dropped from the output. Emits
//   blog/index.html, blog/<slug>/index.html, blog/category/<key>/index.html, blog/rss.xml and sitemap.xml.
import path from "node:path";
import { CATEGORIES, CONTENT_DIR, loadPosts } from "./content.mjs";
import { listPage, postPage, rss, sitemap } from "./templates.mjs";

const SHELL = "blog.html";
const DEV_ASSETS = '<script type="module" src="/src/blog/main.js"></script>';

/** Maps a URL path to a generated document, or null when it is not a blog route. */
function render(urlPath, posts, assets) {
  const p = urlPath.replace(/\/index\.html$/, "/");
  if (p === "/sitemap.xml") return { type: "application/xml", body: sitemap(posts) };
  if (p === "/blog/rss.xml") return { type: "application/rss+xml", body: rss(posts) };
  if (p === "/blog" || p === "/blog/") return { type: "text/html", body: listPage({ posts, assets }) };

  const cat = p.match(/^\/blog\/category\/([a-z0-9-]+)\/?$/);
  if (cat && CATEGORIES[cat[1]]) return { type: "text/html", body: listPage({ posts, category: cat[1], assets }) };

  const post = p.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  if (post) {
    const i = posts.findIndex((x) => x.slug === post[1]);
    if (i === -1) return null;
    return { type: "text/html", body: postPage({ post: posts[i], prev: posts[i + 1], next: posts[i - 1], assets }) };
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
        if (!urlPath.startsWith("/blog") && urlPath !== "/sitemap.xml") return next();
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

      emit("blog/index.html", "/blog/");
      emit("blog/rss.xml", "/blog/rss.xml");
      emit("sitemap.xml", "/sitemap.xml");
      for (const key of Object.keys(CATEGORIES)) emit(`blog/category/${key}/index.html`, `/blog/category/${key}/`);
      for (const p of posts) emit(`blog/${p.slug}/index.html`, `/blog/${p.slug}/`);

      this.info?.(`blog: ${posts.length} post(s) published`);
    },
  };
}
