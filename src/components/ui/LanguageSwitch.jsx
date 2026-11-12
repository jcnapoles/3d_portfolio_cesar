import { cn } from "@/lib/cn";
import { LOCALE, homePath } from "@/i18n";
import { FLAGS } from "@/i18n/flags";
import { switchLanguage } from "@/i18n/switch";

/**
 * Language switch: shows the current language (flag + code) and links to the other locale's page
 * (the locale is fixed per page load). The current section's hash is carried over so the reader
 * lands where they were; the page change runs through switchLanguage (curtain transition).
 */
export default function LanguageSwitch({ className, onNavigate }) {
  const other = LOCALE === "es" ? "en" : "es";
  const href = homePath(other);
  const onClick = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate?.();
    switchLanguage(href + (window.location.hash || ""));
  };
  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      onClick={onClick}
      aria-label={other === "es" ? "Language: English. Ver en español" : "Idioma: español. View in English"}
      title={other === "es" ? "Ver en español" : "View in English"}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-pill px-2.5 font-mono text-hud-xs uppercase text-ink-2 transition-colors duration-ui ease-ui hover:bg-white/[.06] hover:text-ink-1 coarse:h-11",
        className
      )}
    >
      <span aria-hidden="true" className="inline-flex" dangerouslySetInnerHTML={{ __html: FLAGS[LOCALE] }} />
      <span aria-hidden="true" className="text-ink-1">{LOCALE.toUpperCase()}</span>
    </a>
  );
}
