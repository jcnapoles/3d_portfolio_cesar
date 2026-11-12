// Blog page templates: plain HTML strings, rendered at build time (and per request in dev), in English and Spanish.
// Static-first: every page is complete HTML (SEO, no-JS readers, RSS readers); src/blog/main.js only adds
// small enhancements (scrolled nav, mobile menu, reading progress, copy link).
// Tailwind scans this file (tailwind.config.cjs `content`), so utility classes here are generated.
import { CATEGORIES } from "./content.mjs";
import { SITE_URL, PERSON, LINKS, bookingUrl } from "../../src/constants/site.js";
import { FLAGS } from "../../src/i18n/flags.js";

/* ---------- Paths ---------- */

export const blogPath = (lang) => (lang === "es" ? "/es/blog/" : "/blog/");
export const homePath = (lang) => (lang === "es" ? "/es/" : "/");
export const rssPath = (lang) => `${blogPath(lang)}rss.xml`;
export const postPath = (p) => `${blogPath(p.lang)}${p.slug}/`;
export const categoryPath = (key, lang) => `${blogPath(lang)}${lang === "es" ? "categoria" : "category"}/${key}/`;
const abs = (p) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);

/* ---------- UI strings ---------- */

const UI = {
  en: {
    blogTitle: "Mission Log",
    blogDescription: "Cesar Napoles' blog: notes from the CTO seat, product launches and a Fractional CTO's take on tech news.",
    blogLead: "Notes from the CTO seat, the products I launch, and my take on the tech news that matters to startups and SMEs.",
    role: "Fractional CTO",
    tagline: "Fractional CTO for startups and SMEs. Strategy, architecture and teams that ship.",
    bio: "Fractional CTO for startups and SMEs. 12+ years building and scaling software in banking, fintech, insurance and e-commerce.",
    location: "Tarragona, Spain",
    nav: [["/#services", "Services"], ["/#results", "Results"], ["/#about", "About"], ["BLOG", "Blog"], ["/#contact", "Contact"]],
    home: "Home",
    homeAria: "Cesar Napoles, Fractional CTO: home",
    book: "Book",
    bookCall: "Book a call",
    book30: "Book a 30-min call",
    opensBooking: "(opens Closevibe in a new tab)",
    newTab: "(opens in a new tab)",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
    primary: "Primary",
    skip: "Skip to content",
    endOfTransmission: "END OF TRANSMISSION",
    all: "All",
    categories: "Categories",
    entries: (n) => `${n} ${n === 1 ? "ENTRY" : "ENTRIES"}`,
    subscribe: "Subscribe via RSS",
    awaiting: "Awaiting first transmission",
    emptyText: (what) => `The first ${what} is on its way. Follow the RSS feed or LinkedIn to catch it.`,
    post: "post",
    minRead: (n) => `${n} min read`,
    writtenIn: { en: "Written in English", es: "Written in Spanish" },
    read: "Read",
    readPost: "Read the post",
    tags: "Tags",
    allPosts: "All posts",
    commentingOn: "Commenting on",
    source: "Source",
    featuredProduct: "Featured product",
    onThisPage: "On this page",
    aboutAuthor: "About the author",
    share: "Share",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    copyFailed: "Copy failed",
    morePosts: "More posts",
    older: "&larr; Older",
    newer: "Newer &rarr;",
    readIn: "Leer en español",
    switchAria: "Language: English. Ver en español",
    switchTitle: "Ver en español",
    rssTitle: "Cesar Napoles: Mission Log",
    ogLocale: "en_US",
    dateLocale: "en-GB",
  },
  es: {
    blogTitle: "Bitácora de misión",
    blogDescription: "El blog de Cesar Napoles: notas desde la silla de CTO, lanzamientos de producto y la lectura de un CTO fraccional sobre las noticias tech.",
    blogLead: "Notas desde la silla de CTO, los productos que lanzo y mi lectura de las noticias tech que importan a startups y pymes.",
    role: "CTO fraccional",
    tagline: "CTO fraccional para startups y pymes. Estrategia, arquitectura y equipos que entregan.",
    bio: "CTO fraccional para startups y pymes. Más de 12 años construyendo y escalando software en banca, fintech, seguros y e-commerce.",
    location: "Tarragona, España",
    nav: [["/es/#services", "Servicios"], ["/es/#results", "Resultados"], ["/es/#about", "Sobre mí"], ["BLOG", "Blog"], ["/es/#contact", "Contacto"]],
    home: "Inicio",
    homeAria: "Cesar Napoles, CTO fraccional: inicio",
    book: "Reservar",
    bookCall: "Agendar llamada",
    book30: "Agenda una llamada de 30 min",
    opensBooking: "(abre Closevibe en una pestaña nueva)",
    newTab: "(se abre en una pestaña nueva)",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    menu: "Menú",
    primary: "Principal",
    skip: "Saltar al contenido",
    endOfTransmission: "FIN DE LA TRANSMISIÓN",
    all: "Todo",
    categories: "Categorías",
    entries: (n) => `${n} ${n === 1 ? "ENTRADA" : "ENTRADAS"}`,
    subscribe: "Suscríbete por RSS",
    awaiting: "Esperando la primera transmisión",
    emptyText: (what) => `${what} está en camino. Sigue el RSS o LinkedIn para no perdértelo.`,
    post: "El primer post",
    minRead: (n) => `${n} min de lectura`,
    writtenIn: { en: "Escrito en inglés", es: "Escrito en español" },
    read: "Leer",
    readPost: "Leer el post",
    tags: "Etiquetas",
    allPosts: "Todos los posts",
    commentingOn: "Comentando",
    source: "Fuente",
    featuredProduct: "Producto destacado",
    onThisPage: "En esta página",
    aboutAuthor: "Sobre el autor",
    share: "Compartir",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    copyFailed: "No se pudo copiar",
    morePosts: "Más posts",
    older: "&larr; Anterior",
    newer: "Siguiente &rarr;",
    readIn: "Read in English",
    switchAria: "Idioma: español. View in English",
    switchTitle: "View in English",
    rssTitle: "Cesar Napoles: Bitácora de misión",
    ogLocale: "es_ES",
    dateLocale: "es-ES",
  },
};

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const cat = (key, lang) => CATEGORIES[key][lang];
const fmtDate = (iso, lang) =>
  new Intl.DateTimeFormat(UI[lang].dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

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

const LOGO = (lang) =>
  `<span class="inline-flex items-center gap-2.5">${STAR(18, "text-gold")}<span class="flex flex-col"><span class="whitespace-nowrap text-[15px] font-semibold leading-[1.1] tracking-[-0.01em] text-ink-1">Cesar Napoles</span><span class="mt-1 whitespace-nowrap font-mono text-hud-xs uppercase leading-none text-ink-3">${UI[lang].role}</span></span></span>`;

const BTN_PRIMARY =
  "btn-glow group relative isolate inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-gold px-6 text-button text-void shadow-glow-cta stretch-105 transition-colors duration-ui ease-ui hover:bg-gold-hot";
const BTN_GHOST =
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-line-strong bg-white/[.04] px-5 text-small font-medium text-ink-1 transition-colors duration-ui ease-ui hover:border-ink-3 hover:bg-white/[.07]";
const SWITCH =
  "inline-flex h-10 items-center gap-1.5 rounded-pill px-2.5 font-mono text-hud-xs uppercase text-ink-2 transition-colors duration-ui ease-ui hover:bg-white/[.06] hover:text-ink-1 coarse:h-11";

/* ---------- Chrome ---------- */

/** `alt` is the same page in the other language (a translated post, else the other blog index). */
function languageSwitch(lang, alt) {
  const other = lang === "es" ? "en" : "es";
  return `<a href="${alt}" hreflang="${other}" lang="${other}" data-lang-switch="${other}" aria-label="${UI[lang].switchAria}" title="${UI[lang].switchTitle}" class="${SWITCH}"><span aria-hidden="true" class="inline-flex">${FLAGS[lang]}</span><span aria-hidden="true" class="text-ink-1">${lang.toUpperCase()}</span></a>`;
}

function header(lang, alt) {
  const u = UI[lang];
  const nav = u.nav.map(([href, label]) => ({ href: href === "BLOG" ? blogPath(lang) : href, label, blog: href === "BLOG" }));
  const links = nav
    .map(
      (l) =>
        `<li><a href="${l.href}"${l.blog ? ' aria-current="true"' : ""} class="relative flex h-10 items-center rounded-pill px-3.5 text-small transition-colors duration-ui ease-ui ${l.blog ? "text-ink-1" : "text-ink-2 hover:text-ink-1"}">${l.label}<span aria-hidden="true" class="nav-dot absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_6px_rgba(244,184,96,.8)]"></span></a></li>`
    )
    .join("");
  const menuLinks = nav
    .map(
      (l, i) =>
        `<li class="border-b border-line"><a href="${l.href}"${l.blog ? ' aria-current="true"' : ""} class="flex items-center gap-5 py-[18px]"><span aria-hidden="true" class="hud-label w-6 shrink-0 tabular">${String(i + 1).padStart(2, "0")}</span><span class="text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] stretch-110 ${l.blog ? "text-ink-1" : "text-ink-1/[.86]"}">${l.label}</span>${l.blog ? STAR(12, "ml-auto text-gold") : ""}</a></li>`
    )
    .join("");

  return `<header data-blog-nav data-scrolled="false" class="nav-shell pointer-events-none fixed inset-x-0 top-0 z-nav md:pt-4">
  <div class="nav-frame">
    <span aria-hidden="true" class="nav-surface"></span>
    <a href="${homePath(lang)}" aria-label="${u.homeAria}" class="relative -my-1 shrink-0 rounded-sm py-1">${LOGO(lang)}</a>
    <nav aria-label="${u.primary}" class="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"><ul class="flex items-center">${links}</ul></nav>
    <div class="relative flex shrink-0 items-center gap-1 md:gap-1.5">
      <span class="max-[389px]:hidden">${languageSwitch(lang, alt)}</span>
      <a href="${bookingUrl("blog", lang)}" target="_blank" rel="noopener noreferrer" class="${BTN_PRIMARY} max-md:px-4"><span class="md:hidden">${u.book}</span><span class="hidden md:inline">${u.bookCall}</span><span class="sr-only"> ${u.opensBooking}</span></a>
      <button type="button" data-menu-open aria-controls="blog-menu" aria-expanded="false" aria-label="${u.openMenu}" class="inline-flex size-11 items-center justify-center rounded-pill text-ink-1 transition-colors duration-ui ease-ui hover:bg-white/[.06] lg:hidden">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <span aria-hidden="true" class="nav-progress"><span class="nav-progress-line" data-read-progress style="transform:scaleX(0)"></span></span>
  </div>
</header>
<dialog id="blog-menu" aria-label="${u.menu}" class="blog-menu">
  <div class="nav-frame">
    <a href="${homePath(lang)}" aria-label="${u.homeAria}" class="relative -my-1 shrink-0 rounded-sm py-1">${LOGO(lang)}</a>
    <button type="button" data-menu-close aria-label="${u.closeMenu}" class="inline-flex size-11 items-center justify-center rounded-pill text-ink-1 hover:bg-white/[.06]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <nav aria-label="${u.menu}" class="mx-auto w-full max-w-[1120px] px-4 pt-8 md:px-9"><ul class="border-t border-line">${menuLinks}</ul>
    <a href="${bookingUrl("menu", lang)}" target="_blank" rel="noopener noreferrer" class="${BTN_PRIMARY} mt-10 h-14 w-full">${u.book30}<span class="sr-only"> ${u.opensBooking}</span></a>
    <div class="mt-6 border-t border-line pt-3">${languageSwitch(lang, alt)}</div>
  </nav>
</dialog>`;
}

function footer(lang, alt) {
  const u = UI[lang];
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-8 items-center gap-2 text-ink-2 transition-colors duration-ui ease-ui hover:text-ink-1 coarse:min-h-11";
  return `<footer class="relative z-content mt-24 border-t border-line pb-12 pt-14">
  <div class="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-10">
    <div class="flex items-center gap-4" aria-hidden="true"><span class="h-px flex-1 bg-line-strong"></span><span class="hud-label">${u.endOfTransmission}</span><span class="h-px flex-1 bg-line-strong"></span></div>
    <div class="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div>
        <a href="${homePath(lang)}" class="inline-block rounded-sm">${LOGO(lang)}</a>
        <p class="mt-4 max-w-[44ch] text-small text-ink-2">${u.tagline}</p>
      </div>
      <ul class="flex flex-wrap gap-x-6 gap-y-1 text-small">
        <li><a class="${link}" href="${homePath(lang)}">${u.home}</a></li>
        <li><a class="${link}" href="${blogPath(lang)}">Blog</a></li>
        <li><a class="${link}" href="${rssPath(lang)}">${RSS_ICON}RSS</a></li>
        <li><a class="${link}" href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a class="${link}" href="${LINKS.github}" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
    </div>
    <div class="mt-10 flex flex-wrap items-center justify-between gap-4">
      <p class="font-mono text-hud-xs uppercase text-ink-3">&copy; ${year} ${esc(PERSON.name)} &middot; ${u.location}</p>
      ${languageSwitch(lang, alt)}
    </div>
  </div>
</footer>`;
}

/* ---------- Document ---------- */

/**
 * Full HTML document. `assets` are the <script>/<link> tags of the blog entry (src/blog/main.js):
 * the dev server passes the source script, the build passes the hashed tags Vite produced.
 * `alternates` = { en: path, es: path } for hreflang (only the languages that really have this page).
 */
export function layout({ lang, title, description, path, alternates = {}, switchTo, type = "website", image, jsonLd, extraHead = "", body, assets }) {
  const u = UI[lang];
  const url = abs(path);
  const og = abs(image || "/og-image.png");
  const hreflang = Object.keys(alternates).length > 1
    ? [
        ...Object.entries(alternates).map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${abs(p)}" />`),
        `<link rel="alternate" hreflang="x-default" href="${abs(alternates.en || path)}" />`,
      ].join("\n    ")
    : "";
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
        try { if (sessionStorage.getItem('cn:lang-switch')) { sessionStorage.removeItem('cn:lang-switch'); if (!reduced) { d.classList.add('lang-entering'); var finished = false, reveal = function () { if (!finished) d.classList.add('lang-ready'); }; window.addEventListener('load', function () { requestAnimationFrame(function () { requestAnimationFrame(reveal); }); }); setTimeout(reveal, 1500); var done = function () { finished = true; d.classList.remove('lang-entering', 'lang-ready'); }; d.addEventListener('animationend', function (e) { if (e.animationName === 'lang-curtain-out') done(); }); setTimeout(done, 3000); } } } catch (e) {}
      })();
    </script>
    <style>
      /* Language-change curtain: same rules as index.html (inline so it works before the stylesheets load). */
      html.lang-leaving::after, html.lang-entering::after { content: ""; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; background: radial-gradient(120% 80% at 50% 0%, rgba(244,184,96,.07), transparent 60%), #05060A; }
      html.lang-leaving::after { animation: lang-curtain-in .26s cubic-bezier(.4,0,1,1) both; }
      html.lang-entering.lang-ready::after { animation: lang-curtain-out .6s cubic-bezier(.2,.7,.2,1) both; }
      html.lang-leaving body { cursor: progress; }
      @keyframes lang-curtain-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes lang-curtain-out { from { opacity: 1; } to { opacity: 0; } }
    </style>
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    ${hreflang}
    <meta name="theme-color" content="#05060A" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="alternate" type="application/rss+xml" title="${esc(u.rssTitle)}" href="${abs(rssPath(lang))}" />
    <link rel="preload" href="/fonts/mona-sans-latin-standard.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/geist-mono-latin-wght.woff2" as="font" type="font/woff2" crossorigin />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="${esc(PERSON.name)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${og}" />
    <meta property="og:locale" content="${u.ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${og}" />
    ${extraHead}
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
    ${assets}
  </head>
  <body data-copy-labels='${JSON.stringify({ idle: u.copyLink, done: u.linkCopied, fail: u.copyFailed }).replace(/'/g, "&#39;")}'>
    <a href="#main" class="blog-skip">${u.skip}</a>
    <div aria-hidden="true" class="blog-sky"></div>
    ${header(lang, switchTo)}
    <main id="main" tabindex="-1" class="relative z-content pt-28 md:pt-36">
${body}
    </main>
    ${footer(lang, switchTo)}
  </body>
</html>`;
}

/* ---------- Pieces ---------- */

function meta(p) {
  const u = UI[p.lang];
  const t = TONE[p.category];
  const bits = [
    `<a href="${categoryPath(p.category, p.lang)}" class="inline-flex items-center gap-2 ${t.text} hover:underline"><span aria-hidden="true" class="size-1.5 rounded-full ${t.dot}"></span>${esc(cat(p.category, p.lang).label)}</a>`,
    `<time datetime="${p.date}">${fmtDate(p.date, p.lang)}</time>`,
    `<span>${u.minRead(p.readingMinutes)}</span>`,
  ];
  if (p.draft) bits.push(`<span class="rounded-xs bg-danger/15 px-1.5 py-0.5 text-danger">DRAFT</span>`);
  if (p.scheduled) bits.push(`<span class="rounded-xs bg-ion/15 px-1.5 py-0.5 text-ion">SCHEDULED</span>`);
  return `<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-hud-xs uppercase text-ink-3">${bits.join('<span aria-hidden="true" class="text-ink-3/50">/</span>')}</div>`;
}

const tagList = (tags, lang) =>
  tags.length
    ? `<ul class="flex flex-wrap gap-2" aria-label="${UI[lang].tags}">${tags.map((t) => `<li class="rounded-sm border border-line bg-space-600/60 px-2.5 py-1 font-mono text-[12px] leading-[1.4] text-ink-2">#${esc(t)}</li>`).join("")}</ul>`
    : "";

function card(p, { featured = false } = {}) {
  const u = UI[p.lang];
  return `<article class="blog-card card-k1 group relative flex flex-col p-6 md:p-8 ${featured ? "lg:col-span-2 lg:p-10" : ""}">
  ${meta(p)}
  <h${featured ? 2 : 3} class="mt-4 ${featured ? "text-h3 md:text-[2.5rem] md:leading-[1.08]" : "text-h4 md:text-[1.5rem] md:leading-[1.2]"} font-semibold tracking-[-0.02em] text-ink-1">
    <a href="${postPath(p)}" class="blog-card-link">${esc(p.title)}</a>
  </h${featured ? 2 : 3}>
  <p class="mt-3 ${featured ? "max-w-[62ch] text-lead" : "text-body"} text-ink-2">${esc(p.summary)}</p>
  ${p.tags.length ? `<div class="mt-6">${tagList(p.tags.slice(0, 4), p.lang)}</div>` : ""}
  <span aria-hidden="true" class="mt-auto inline-flex items-center gap-1.5 pt-6 text-small font-medium text-ink-1">${featured ? u.readPost : u.read}<span class="transition-transform duration-ui ease-ui motion-ok:group-hover:translate-x-1">&rarr;</span></span>
</article>`;
}

function categoryTabs(active, lang) {
  const tabs = [
    { key: null, label: UI[lang].all, href: blogPath(lang) },
    ...Object.keys(CATEGORIES).map((key) => ({ key, label: cat(key, lang).label, href: categoryPath(key, lang) })),
  ];
  return `<nav aria-label="${UI[lang].categories}" class="mt-10 -mx-4 overflow-x-auto px-4 [scrollbar-width:none]"><ul class="flex w-max gap-2">${tabs
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

/** Blog index (category = null) and category pages, for one language. `posts` = all posts (every language). */
export function listPage({ posts: allPosts, lang, category = null, assets }) {
  const u = UI[lang];
  const other = lang === "es" ? "en" : "es";
  const posts = allPosts.filter((p) => p.lang === lang);
  const c = category ? cat(category, lang) : null;
  const list = category ? posts.filter((p) => p.category === category) : posts;
  const featured = !category ? list.find((p) => p.featured) || list[0] : null;
  const rest = featured ? list.filter((p) => p !== featured) : list;

  const grid = list.length
    ? `<div class="mt-12 grid gap-5 md:grid-cols-2 lg:gap-6">${featured ? card(featured, { featured: true }) : ""}${rest.map((p) => card(p)).join("")}</div>`
    : `<div class="panel-blueprint mt-12 flex flex-col items-center px-6 py-20 text-center">
        ${STAR(22, "text-gold")}
        <p class="mt-5 font-mono text-hud uppercase text-ink-3">${u.awaiting}</p>
        <p class="mt-3 max-w-[44ch] text-body text-ink-2">${esc(u.emptyText(u.post))}</p>
      </div>`;

  const body = container(`
    ${hudRow(`BLOG / ${c ? c.hud : u.blogTitle.toUpperCase()}`, u.entries(list.length))}
    <h1 class="mt-6 text-display-l stretch-110 text-ink-1">${esc(c ? c.label : u.blogTitle)}</h1>
    <p class="mt-6 max-w-measure text-lead text-ink-2">${esc(c ? c.description : u.blogLead)}</p>
    <p class="mt-5"><a href="${rssPath(lang)}" class="inline-flex items-center gap-2 font-mono text-hud-xs uppercase text-ink-3 transition-colors hover:text-ink-1">${RSS_ICON}${u.subscribe}</a></p>
    ${categoryTabs(category, lang)}
    ${grid}
  `);

  const path = c ? categoryPath(category, lang) : blogPath(lang);
  const altPath = c ? categoryPath(category, other) : blogPath(other);
  return layout({
    lang,
    title: c ? `${c.label} | Blog | ${PERSON.name}` : `Blog | ${PERSON.name}, ${u.role}`,
    description: c ? c.description : u.blogDescription,
    path,
    alternates: { [lang]: path, [other]: altPath },
    switchTo: altPath,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${abs(blogPath(lang))}#blog`,
      url: abs(path),
      name: `${PERSON.name}: ${u.blogTitle}`,
      description: u.blogDescription,
      inLanguage: lang,
      author: { "@id": `${SITE_URL}/#person` },
      blogPost: list.slice(0, 20).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: abs(postPath(p)), datePublished: p.date })),
    },
    body,
    assets,
  });
}

/** One post. `prev` is the older neighbour, `next` the newer one (same language). */
export function postPage({ post: p, prev, next, assets }) {
  const u = UI[p.lang];
  const other = p.lang === "es" ? "en" : "es";
  const c = cat(p.category, p.lang);
  const url = abs(postPath(p));

  const source = p.source
    ? `<aside class="panel-blueprint mt-10 p-5 md:p-6" aria-label="${u.source}">
        <p class="font-mono text-hud-xs uppercase text-ion">${u.commentingOn}</p>
        <a href="${esc(p.source.url)}" target="_blank" rel="noopener noreferrer" class="group mt-2 flex items-start justify-between gap-4 text-body font-medium text-ink-1">
          <span>${esc(p.source.title)}${p.source.publisher ? `<span class="block text-small font-normal text-ink-3">${esc(p.source.publisher)}</span>` : ""}</span>
          <span class="mt-1 text-ink-2 transition-transform duration-ui ease-ui group-hover:text-ink-1 motion-ok:group-hover:-translate-y-0.5 motion-ok:group-hover:translate-x-0.5">${ARROW_UR}</span>
        </a>
      </aside>`
    : "";

  const sep = p.product?.url.includes("?") ? "&amp;" : "?";
  const product = p.product
    ? `<aside class="card-k1 mt-14 overflow-hidden p-6 md:p-8" aria-label="${esc(p.product.name)}">
        <p class="font-mono text-hud-xs uppercase text-signal">${u.featuredProduct}</p>
        <p class="mt-3 text-h4 text-ink-1">${esc(p.product.name)}</p>
        ${p.product.pitch ? `<p class="mt-2 max-w-[56ch] text-body text-ink-2">${esc(p.product.pitch)}</p>` : ""}
        <a href="${esc(p.product.url)}${sep}utm_source=cesarnapoles.com&amp;utm_medium=blog&amp;utm_campaign=${esc(p.slug)}" target="_blank" rel="noopener" class="${BTN_PRIMARY} mt-6 h-12">${esc(p.product.cta)}${ARROW_UR}<span class="sr-only"> ${u.newTab}</span></a>
      </aside>`
    : "";

  const toc = p.toc.length
    ? `<details class="blog-toc mt-10 rounded-md border border-line px-5 py-4" open>
        <summary class="font-mono text-hud-xs uppercase text-ink-3">${u.onThisPage}</summary>
        <ol class="mt-3 space-y-1.5 text-small">${p.toc.map((h) => `<li class="${h.depth === 3 ? "pl-4" : ""}"><a class="text-ink-2 hover:text-ink-1" href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ol>
      </details>`
    : "";

  const neighbour = (q, label, align) =>
    q
      ? `<a href="${postPath(q)}" class="card-k1 group flex flex-col p-5 ${align}"><span class="font-mono text-hud-xs uppercase text-ink-3">${label}</span><span class="mt-2 text-body font-medium text-ink-1 group-hover:underline">${esc(q.title)}</span></a>`
      : "<span></span>";

  const readIn = p.alternate
    ? `<a href="${postPath(p.alternate)}" hreflang="${other}" lang="${other}" class="inline-flex min-h-10 items-center gap-2 rounded-pill border border-line-strong px-4 text-small text-ink-2 transition-colors hover:border-ink-3 hover:text-ink-1"><span aria-hidden="true" class="font-mono text-hud-xs uppercase">${other}</span>${u.readIn}</a>`
    : "";

  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const body = container(
    `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <a href="${blogPath(p.lang)}" class="inline-flex min-h-10 items-center gap-2 text-small text-ink-2 transition-colors hover:text-ink-1">${ARROW_L}${u.allPosts}</a>
      ${readIn}
    </div>
    <article class="mt-6">
      <header>
        ${meta(p)}
        <h1 class="mt-5 text-[clamp(2.25rem,1.2rem+3.4vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] stretch-110 text-ink-1">${esc(p.title)}</h1>
        <p class="mt-6 text-lead text-ink-2">${esc(p.summary)}</p>
        ${p.tags.length ? `<div class="mt-6">${tagList(p.tags, p.lang)}</div>` : ""}
        ${p.cover ? `<figure class="mt-10 overflow-hidden rounded-lg border border-line"><img src="${esc(p.cover)}" alt="${esc(p.coverAlt)}" width="1280" height="720" class="h-auto w-full" fetchpriority="high" /></figure>` : ""}
      </header>
      ${source}
      ${toc}
      <div class="prose-blog mt-10">
${p.html}
      </div>
      ${product}
    </article>

    <section aria-label="${u.aboutAuthor}" class="mt-16 flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center">
      <img src="/cesar.webp" alt="" width="64" height="64" class="size-16 shrink-0 rounded-full border border-line-strong object-cover" loading="lazy" />
      <div class="flex-1">
        <p class="text-body font-semibold text-ink-1">${esc(PERSON.name)}</p>
        <p class="mt-1 text-small text-ink-2">${u.bio}</p>
      </div>
      <a href="${bookingUrl("blog-post", p.lang)}" target="_blank" rel="noopener noreferrer" class="${BTN_PRIMARY} h-12 shrink-0">${u.bookCall}<span class="sr-only"> ${u.opensBooking}</span></a>
    </section>

    <div class="mt-8 flex flex-wrap items-center gap-2">
      <span class="mr-2 font-mono text-hud-xs uppercase text-ink-3">${u.share}</span>
      <a href="${shareLinkedIn}" target="_blank" rel="noopener noreferrer" class="${BTN_GHOST}">LinkedIn<span class="sr-only"> ${u.newTab}</span></a>
      <button type="button" data-copy-link="${url}" class="${BTN_GHOST}"><span data-copy-label>${u.copyLink}</span></button>
    </div>

    <nav aria-label="${u.morePosts}" class="mt-14 grid gap-4 md:grid-cols-2">
      ${neighbour(prev, u.older, "")}
      ${neighbour(next, u.newer, "md:text-right")}
    </nav>
  `,
    "max-w-[760px]"
  );

  const image = p.cover && !p.cover.endsWith(".avif") ? p.cover : undefined;
  const alternates = p.alternate ? { [p.lang]: postPath(p), [other]: postPath(p.alternate) } : {};
  return layout({
    lang: p.lang,
    title: `${p.title} | ${PERSON.name}`,
    description: p.summary,
    path: postPath(p),
    alternates,
    switchTo: p.alternate ? postPath(p.alternate) : blogPath(other),
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
      isPartOf: { "@id": `${abs(blogPath(p.lang))}#blog` },
      ...(p.source ? { citation: p.source.url } : {}),
    },
    body,
    assets,
  });
}

/* ---------- Feeds ---------- */

export function rss(allPosts, lang) {
  const u = UI[lang];
  const posts = allPosts.filter((p) => p.lang === lang);
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(postPath(p))}</link>
      <guid isPermaLink="true">${abs(postPath(p))}</guid>
      <pubDate>${new Date(`${p.date}T08:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(cat(p.category, lang).label)}</category>
      <description>${esc(p.summary)}</description>
      <content:encoded><![CDATA[${p.html.replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(u.rssTitle)}</title>
    <link>${abs(blogPath(lang))}</link>
    <description>${esc(u.blogDescription)}</description>
    <language>${lang}</language>
    <atom:link href="${abs(rssPath(lang))}" rel="self" type="application/rss+xml" />
    ${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].date}T08:00:00Z`).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;
}

export function sitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const latest = (lang, key) => posts.find((p) => p.lang === lang && (!key || p.category === key))?.date || today;
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today },
    { loc: `${SITE_URL}/es/`, lastmod: today },
    ...["en", "es"].flatMap((lang) => [
      { loc: abs(blogPath(lang)), lastmod: latest(lang) },
      ...Object.keys(CATEGORIES).map((k) => ({ loc: abs(categoryPath(k, lang)), lastmod: latest(lang, k) })),
    ]),
    ...posts.map((p) => ({ loc: abs(postPath(p)), lastmod: p.updated || p.date })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
}
