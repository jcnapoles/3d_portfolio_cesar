// i18n for the 2026 site. English lives at /, Spanish at /es/ (a separate HTML page generated from index.html by
// scripts/i18n/vite-plugin-locales.mjs, with <html lang="es">). The locale is therefore fixed for the whole page
// load: no context, no re-render on change. Switching language is a navigation (LanguageSwitch).
//
// Usage:  t({ en: "Results", es: "Resultados" })  -> the string (or any value) for the current page's locale.
// Node-safe (no `@/` imports, no DOM access at import time without a guard): scripts/blog imports site.js.

export const LOCALES = ["en", "es"];

const htmlLang = typeof document !== "undefined" ? document.documentElement.lang || "en" : "en";
export const LOCALE = htmlLang.toLowerCase().startsWith("es") ? "es" : "en";
export const isEs = LOCALE === "es";

/** Picks the current locale's value from a { en, es } map. Anything else is returned unchanged. */
export function t(value) {
  if (value && typeof value === "object" && !Array.isArray(value) && "en" in value) {
    return value[LOCALE] ?? value.en;
  }
  return value;
}

/** Home path of a locale: "/" or "/es/". */
export const homePath = (locale = LOCALE) => (locale === "es" ? "/es/" : "/");

/** Blog path of a locale: "/blog/" or "/es/blog/". */
export const blogPath = (locale = LOCALE) => (locale === "es" ? "/es/blog/" : "/blog/");

/** BCP-47 tag for Intl formatting. */
export const intlLocale = (locale = LOCALE) => (locale === "es" ? "es-ES" : "en-GB");
