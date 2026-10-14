import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import BrowserFrame from "@/components/ui/BrowserFrame";
import Picture from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import StatusDot from "@/components/ui/StatusDot";
import { cn } from "@/lib/cn";
import { CSS_EASE } from "@/lib/motion";
import { projectShots } from "@/assets/media";
import { BUILDS } from "@/constants/builds";

const BY_KEY = Object.fromEntries(BUILDS.map((b, i) => [b.key, { ...b, index: i }]));
const nextKey = (key) => BUILDS[((BY_KEY[key]?.index ?? -1) + 1) % BUILDS.length].key;
const hostOf = (href) => {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return href;
  }
};
const pad = (n) => String(n).padStart(2, "0");

const CROSSFADE_MS = 280;
const DECODE_TIMEOUT_MS = 700; // never wait longer than this for a decode before swapping
// Panel width: 5/12 of the 1200 px container minus the gutter (~470 px), ~38vw between 1024 and 1280.
const SIZES = "(min-width: 1280px) 480px, 38vw";

/**
 * Builds sticky preview (>= 1024 px, right column, sticky at 120 px): a BrowserFrame with the active
 * project's screenshot, its position in the fleet and its status.
 *
 * Layers: every project that has been active stays mounted as a stacked <Picture> (so going back never
 * reloads), plus the project after the active one, preloaded in a hidden layer. A change swaps only
 * once the new layer's own <img>.decode() resolves (the browser's AVIF/WebP + srcset pick is the one
 * that gets preloaded, nothing downloads twice), then the new layer fades in over the previous one
 * (280 ms, WAAPI, opacity only). Reduced motion: instant swap. Images stay lazy: nothing is fetched
 * before the section approaches the viewport.
 *
 * Decorative duplicate of the list (aria-hidden): the frame is a pointer-only shortcut to the site
 * (tabIndex -1); keyboard and screen-reader users get the same link on the row itself.
 */
export default function BuildPreview({ activeKey, reduced, className }) {
  const [mounted, setMounted] = useState(() => [activeKey, nextKey(activeKey)]);
  const [view, setView] = useState({ shown: activeKey, prev: null });
  const imgs = useRef(new Map());
  const layers = useRef(new Map());
  const anims = useRef(new Map());

  // Mount the active project's layer and preload the next one.
  useEffect(() => {
    setMounted((list) => {
      const add = [activeKey, nextKey(activeKey)].filter((key, i, all) => !list.includes(key) && all.indexOf(key) === i);
      return add.length ? [...list, ...add] : list;
    });
  }, [activeKey]);

  // Swap to the active layer once its image is decoded.
  useEffect(() => {
    if (activeKey === view.shown) return undefined;
    const img = imgs.current.get(activeKey);
    if (!img) return undefined; // its layer mounts on the next render (`mounted` re-runs this effect)
    let cancelled = false;
    const swap = () => {
      if (cancelled) return;
      cancelled = true;
      setView((v) => (v.shown === activeKey ? v : { shown: activeKey, prev: v.shown }));
    };
    const timer = setTimeout(swap, DECODE_TIMEOUT_MS);
    if (typeof img.decode === "function") img.decode().then(swap, swap);
    else swap();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeKey, view.shown, mounted]);

  // Crossfade: the new layer fades in on top; the previous one stays opaque underneath.
  // Runs once per swap (toggling the motion preference never replays it).
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  useLayoutEffect(() => {
    if (!view.prev) return;
    anims.current.get(view.prev)?.finish();
    const el = layers.current.get(view.shown);
    if (reducedRef.current || !el || typeof el.animate !== "function") return;
    anims.current.get(view.shown)?.cancel();
    anims.current.set(view.shown, el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: CROSSFADE_MS, easing: CSS_EASE.ui }));
  }, [view]);

  useEffect(() => {
    const running = anims.current;
    return () => running.forEach((anim) => anim.cancel());
  }, []);

  const build = BY_KEY[view.shown] ?? BY_KEY[activeKey];
  const live = build.status === "LIVE";

  return (
    <aside aria-hidden="true" className={cn("builds-preview", className)}>
      <Reveal className="builds-preview-sticky">
        <a
          href={build.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          data-cursor="lock"
          className="group/preview relative block rounded-md shadow-float"
        >
          <BrowserFrame url={hostOf(build.href)} className="flex flex-col">
            <div className="relative aspect-[16/10] overflow-clip bg-space-900">
              {mounted.map((key) => {
                const shown = key === view.shown;
                const under = key === view.prev;
                return (
                  <div
                    key={key}
                    ref={(el) => (el ? layers.current.set(key, el) : layers.current.delete(key))}
                    className="absolute inset-0"
                    style={{ zIndex: shown ? 2 : under ? 1 : 0, opacity: shown || under ? 1 : 0 }}
                  >
                    <Picture
                      ref={(el) => (el ? imgs.current.set(key, el) : imgs.current.delete(key))}
                      image={projectShots[key]}
                      alt={`${BY_KEY[key]?.name ?? key} screenshot`}
                      sizes={SIZES}
                      className="block size-full"
                      imgClassName="size-full object-cover object-top"
                    />
                  </div>
                );
              })}
            </div>
          </BrowserFrame>
          {/* Rides in the browser bar's right end (the bar is 28 px tall). */}
          <span className="absolute right-1.5 top-1 z-[3] inline-flex h-5 items-center gap-0.5 rounded-pill bg-gold pl-2.5 pr-1.5 text-[11px] font-semibold leading-none text-void group-hover/preview:bg-gold-hot motion-ok:transition-colors motion-ok:duration-ui motion-ok:ease-ui">
            {live ? "Visit" : "Preview"}
            <ArrowUpRight size={12} strokeWidth={2.5} aria-hidden="true" />
          </span>
        </a>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="flex min-w-0 items-baseline gap-3">
            <span className="font-mono text-[12px] tabular tracking-[0.14em] text-gold">
              {pad(build.index + 1)} / {pad(BUILDS.length)}
            </span>
            <span className="truncate text-small font-semibold text-ink-1">{build.name}</span>
            {build.lead ? <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ion">Platform I lead</span> : null}
          </p>
          <p className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase leading-none tracking-[0.14em]">
            {live ? <StatusDot /> : <span className="inline-block size-2 shrink-0 rounded-full border border-ink-3" />}
            <span className={live ? "text-ink-1" : "text-ink-3"}>{live ? "Live" : "Preview"}</span>
          </p>
        </div>

        <ol className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${BUILDS.length}, minmax(0, 1fr))` }}>
          {BUILDS.map((b) => (
            <li key={b.key} className="builds-preview-seg" data-on={b.key === build.key ? "true" : undefined} />
          ))}
        </ol>
      </Reveal>
    </aside>
  );
}
