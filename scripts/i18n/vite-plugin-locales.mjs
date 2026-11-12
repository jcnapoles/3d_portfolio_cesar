// Vite plugin: the Spanish home page (/es/).
// index.html stays the single source. /es/ is the same document with <html lang="es">, Spanish title / meta / OG,
// its own canonical and hreflang alternates on both pages. The app reads <html lang> once at boot (src/i18n).
// - Dev: a middleware serves /es and /es/ from index.html through the transform.
// - Build: the built index.html (hashed assets) is transformed and emitted as es/index.html.
import fs from "node:fs";
import path from "node:path";

const SITE = "https://cesarnapoles.com";

const ES = {
  title: "Cesar Napoles | CTO fraccional para startups y pymes",
  description:
    "CTO fraccional con más de 12 años escalando software en banca, fintech, seguros y e-commerce. Estrategia, arquitectura y equipos que entregan. Reserva una llamada.",
  ogTitle: "Cesar Napoles | CTO fraccional",
  ogDescription:
    "Liderazgo técnico sénior sin contratar a tiempo completo: estrategia, arquitectura y equipos que entregan. Más de 12 años; Senior Tech Lead en CaixaBank Tech.",
  twDescription: "Liderazgo técnico sénior sin contratar a tiempo completo: estrategia, arquitectura y equipos que entregan.",
  ogImageAlt: "Cesar Napoles, CTO fraccional. Liderazgo técnico sénior sin contratar a tiempo completo.",
};

const hreflang = () =>
  [
    `<link rel="alternate" hreflang="en" href="${SITE}/" />`,
    `<link rel="alternate" hreflang="es" href="${SITE}/es/" />`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
  ].join("\n    ");

const setMeta = (html, attr, key, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${value}$2`);

/** English page: only adds the hreflang alternates. */
export function toEnglish(html) {
  return html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n    ${hreflang()}`);
}

/** Spanish page from the English document. */
export function toSpanish(html) {
  let out = html
    .replace(/\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, "")
    .replace(/<html lang="en"/, '<html lang="es"')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${ES.title}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${SITE}/es/" />\n    ${hreflang()}`);
  out = setMeta(out, "name", "description", ES.description);
  out = setMeta(out, "property", "og:url", `${SITE}/es/`);
  out = setMeta(out, "property", "og:title", ES.ogTitle);
  out = setMeta(out, "property", "og:description", ES.ogDescription);
  out = setMeta(out, "property", "og:image:alt", ES.ogImageAlt);
  out = setMeta(out, "property", "og:locale", "es_ES");
  out = setMeta(out, "name", "twitter:title", ES.ogTitle);
  out = setMeta(out, "name", "twitter:description", ES.twDescription);
  return out.replace(/"inLanguage":"en"/, '"inLanguage":"es"');
}

export default function localesPlugin() {
  return {
    name: "cn-locales",
    enforce: "post",

    // Dev + build: hreflang on the English page.
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (ctx.filename && path.basename(ctx.filename) !== "index.html") return html;
        return html.includes('hreflang="es"') ? html : toEnglish(html);
      },
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = (req.url || "").split("?")[0];
        if (urlPath !== "/es" && urlPath !== "/es/" && urlPath !== "/es/index.html") return next();
        try {
          const source = fs.readFileSync(path.resolve("index.html"), "utf8");
          const html = await server.transformIndexHtml("/es/", source);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(toSpanish(html));
        } catch (error) {
          next(error);
        }
      });
    },

    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (!index) return;
      this.emitFile({ type: "asset", fileName: "es/index.html", source: toSpanish(String(index.source)) });
    },
  };
}
