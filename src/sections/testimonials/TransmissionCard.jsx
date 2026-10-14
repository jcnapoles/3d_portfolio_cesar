import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { m } from "motion/react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Picture from "@/components/ui/Picture";
import ExternalLink from "@/components/ui/ExternalLink";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { testimonialPhotos } from "@/assets/media";
import useMotionPreference from "@/hooks/useMotionPreference";

const OPEN_QUOTE = "“";
const CLOSE_QUOTE = "”";

/* ---------- Timing (seconds). Every child gets an absolute delay that includes the card's own stagger
   delay (`base`): Motion lets a child's transition.delay override a parent's delayChildren. ---------- */
const WORDS_START = 0.08; // featured quote lines start just after the card begins to rise
const LINE_STAGGER = 0.05; // 50 ms between lines
const WORD_RISE = 12;
const SWEEP_DURATION = 0.5; // highlight sweep, EASE.out
const SWEEP_AFTER_TEXT = 0.3; // the sweep starts once the (ease-out) text reveal has visually settled
const SWEEP_AFTER_CARD = 0.32; // non-featured: after the card's own fade-up has settled

/* The highlight band covers 84% of the inline box, sitting towards the baseline: at line-height 1.3 a full-height
   band (font content area ~1.41em) would overlap the band of the line above it. */
const MARK_BAND = "84%";
const MARK_CLASS = "bg-transparent bg-g-gold-tint bg-no-repeat text-inherit [background-position:0_70%]";

const markVariants = {
  hidden: { backgroundSize: `0% ${MARK_BAND}` },
  show: (t) => ({
    backgroundSize: `100% ${MARK_BAND}`,
    transition: { delay: t?.delay ?? 0, duration: t?.duration ?? SWEEP_DURATION, ease: t?.ease ?? EASE.out },
  }),
};

const wordVariants = {
  hidden: { opacity: 0, y: WORD_RISE },
  show: (c) => ({
    opacity: 1,
    y: 0,
    transition: { delay: (c?.base ?? 0) + WORDS_START + (c?.line ?? 0) * LINE_STAGGER, duration: DUR.reveal, ease: EASE.out },
  }),
};

/* ---------- Waveform: 3 bars of 1 px ion; amplitude 0 -> 1 -> .15 once in view, then static ----------
   Amplitude scales the part of each bar above a 2 px carrier, so the resting .15 state still reads as three short
   bars (a live, idle channel) rather than three dots that look like an ellipsis. */
const WAVE_H = 12;
const CARRIER = 2;
const REST = 0.15;
const BARS = [
  { x: 2, h: 6 },
  { x: 8, h: 12 },
  { x: 14, h: 9 },
].map((b) => ({ ...b, rest: (CARRIER + REST * (b.h - CARRIER)) / b.h }));
const barVariants = {
  hidden: { scaleY: 0 },
  show: (c) => ({
    scaleY: [0, 1, c?.rest ?? REST],
    transition: {
      delay: (c?.base ?? 0) + 0.12 + (c?.i ?? 0) * 0.05,
      duration: 0.8,
      times: [0, 0.38, 1],
      ease: [EASE.out, EASE.inout],
    },
  }),
};

function Waveform({ base, still }) {
  return (
    <svg
      viewBox={`0 0 17 ${WAVE_H}`}
      width="17"
      height={WAVE_H}
      className="ml-auto shrink-0 self-center fill-ion"
      aria-hidden="true"
      focusable="false"
    >
      {BARS.map((b, i) =>
        still ? (
          // Reduced motion: the resting state, drawn directly.
          <rect key={b.x} x={b.x} y={(WAVE_H - b.h * b.rest) / 2} width={1} height={b.h * b.rest} />
        ) : (
          <m.rect key={b.x} x={b.x} y={(WAVE_H - b.h) / 2} width={1} height={b.h} custom={{ base, i, rest: b.rest }} variants={barVariants} />
        )
      )}
    </svg>
  );
}

/* ---------- Quote helpers ---------- */
function highlightRange(quote, highlight) {
  const start = highlight ? quote.indexOf(highlight) : -1;
  return start < 0 ? { start: -1, end: -1 } : { start, end: start + highlight.length };
}

/** Splits the quote into word + trailing-space tokens, each cut into pre / highlighted / post parts. */
function tokenize(quote, start, end) {
  const out = [];
  const re = /\S+\s*/g;
  let mt = re.exec(quote);
  while (mt) {
    const s = mt.index;
    const text = mt[0];
    const e = s + text.length;
    const a = start < 0 ? e : Math.min(Math.max(start, s), e);
    const b = start < 0 ? e : Math.min(Math.max(end, s), e);
    out.push({ pre: text.slice(0, a - s), mid: text.slice(a - s, b - s), post: text.slice(b - s) });
    mt = re.exec(quote);
  }
  return out;
}

// Inverse of EASE.out (cubic-bezier .16, 1, .3, 1): the time fraction at which the eased progress reaches `y`.
const [EX1, EY1, EX2, EY2] = EASE.out;
const bezierAxis = (p1, p2, s) => 3 * p1 * s * (1 - s) * (1 - s) + 3 * p2 * s * s * (1 - s) + s * s * s;
function easeOutTimeAt(y) {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 24; k += 1) {
    const s = (lo + hi) / 2;
    if (bezierAxis(EY1, EY2, s) < y) lo = s;
    else hi = s;
  }
  return bezierAxis(EX1, EX2, (lo + hi) / 2);
}

/**
 * Featured quote: words are inline-block spans (whitespace preserved inside each span, text-indent reset) so
 * they can rise. They are grouped into rendered lines by measuring offsetTop, and each line fades up 60 ms
 * after the previous one. The highlight is cut per word; one EASE.out sweep runs across all pieces in order,
 * and a highlighted space that ends a line is moved out of the mark so the band never overhangs the line end.
 */
/* Under reduced motion (including a runtime switch, which leaves Motion's in-flight non-transform animations
   running) the quote renders with plain elements in their final state: words in place, highlight at full size. */
const STILL_MARK_STYLE = { backgroundSize: `100% ${MARK_BAND}` };
function Mark({ still, timing, children }) {
  return still ? (
    <mark className={MARK_CLASS} style={STILL_MARK_STYLE}>
      {children}
    </mark>
  ) : (
    <m.mark custom={timing} variants={markVariants} className={MARK_CLASS}>
      {children}
    </m.mark>
  );
}

const WORD_CLASS = "inline-block whitespace-pre indent-0";
function Word({ still, custom, children }) {
  return still ? (
    <span data-token="" className={WORD_CLASS}>
      {children}
    </span>
  ) : (
    <m.span data-token="" custom={custom} variants={wordVariants} className={WORD_CLASS}>
      {children}
    </m.span>
  );
}

function FeaturedQuote({ quote, highlight, base, still }) {
  const ref = useRef(null);
  const { start, end } = useMemo(() => highlightRange(quote, highlight), [quote, highlight]);
  const tokens = useMemo(() => tokenize(quote, start, end), [quote, start, end]);
  const [lines, setLines] = useState(() => tokens.map(() => 0));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const spans = el.querySelectorAll("[data-token]");
      const next = [];
      let line = -1;
      let lastTop = -Infinity;
      spans.forEach((span) => {
        const top = span.offsetTop;
        if (top > lastTop + 1) {
          line += 1;
          lastTop = top;
        }
        next.push(line);
      });
      setLines((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
    };
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => {
      alive = false;
      ro?.disconnect();
    };
  }, [tokens]);

  const lastLine = lines.length ? Math.max(...lines) : 0;
  const sweepStart = base + WORDS_START + lastLine * LINE_STAGGER + SWEEP_AFTER_TEXT;

  // Final per-token parts (line-end spaces moved out of the mark) and the total highlighted length.
  const parts = tokens.map((t, i) => {
    const lineEnd = i === tokens.length - 1 || lines[i + 1] !== lines[i];
    let { mid, post } = t;
    if (mid && lineEnd && /\s$/.test(mid)) {
      const trimmed = mid.trimEnd();
      post = mid.slice(trimmed.length) + post;
      mid = trimmed;
    }
    return { pre: t.pre, mid, post };
  });
  const total = parts.reduce((sum, p) => sum + p.mid.length, 0) || 1;

  let offset = 0;
  return (
    <blockquote ref={ref} className="mt-8 text-quote text-ink-1 lg:mt-10">
      <p className="-indent-[.42em]">
        {parts.map((p, i) => {
          let timing = null;
          if (p.mid) {
            const t0 = SWEEP_DURATION * easeOutTimeAt(offset / total);
            offset += p.mid.length;
            const t1 = SWEEP_DURATION * easeOutTimeAt(offset / total);
            timing = { delay: sweepStart + t0, duration: Math.max(0.016, t1 - t0), ease: "linear" };
          }
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Word key={i} still={still} custom={{ base, line: lines[i] ?? 0 }}>
              {i === 0 ? OPEN_QUOTE : null}
              {p.pre}
              {p.mid ? (
                <Mark still={still} timing={timing}>
                  {p.mid}
                </Mark>
              ) : null}
              {p.post}
              {i === parts.length - 1 ? CLOSE_QUOTE : null}
            </Word>
          );
        })}
      </p>
    </blockquote>
  );
}

function PlainQuote({ quote, highlight, base, still }) {
  const { start, end } = highlightRange(quote, highlight);
  return (
    <blockquote className="mt-6 text-body text-ink-1">
      <p className="-indent-[.42em]">
        {OPEN_QUOTE}
        {start < 0 ? (
          quote
        ) : (
          <>
            {quote.slice(0, start)}
            <Mark still={still} timing={{ delay: base + SWEEP_AFTER_CARD, duration: SWEEP_DURATION, ease: EASE.out }}>
              {quote.slice(start, end)}
            </Mark>
            {quote.slice(end)}
          </>
        )}
        {CLOSE_QUOTE}
      </p>
    </blockquote>
  );
}

/**
 * 6.9 One testimonial: a <figure> inside a SpotlightCard. It must be rendered inside a Motion variant parent
 * (Testimonials wraps each card in <Reveal>): the waveform, the featured line reveal and the highlight sweep
 * all run off that parent's hidden/show state. Under reduced motion (at load or switched at runtime) those parts
 * render as plain elements in their final state: text in place, waveform at rest (.15), highlight at full size.
 *
 * - featured: text-quote, 96 px photo, line fade-up then sweep.
 * - compact: the narrow side-by-side cards at >= 1280 (tighter header tracking, photo above the name).
 * - base: the card's stagger delay in seconds, added to every child animation.
 */
export default function TransmissionCard({ transmission: t, featured = false, compact = false, base = 0, className }) {
  const { reduced } = useMotionPreference();
  const photo = testimonialPhotos[t.photo];
  return (
    <SpotlightCard as="div" padding={featured ? "lg" : "md"} className={cn("flex w-full flex-col", compact && "xl:p-6", className)}>
      {featured ? (
        <span
          aria-hidden="true"
          data-glow=""
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-[radial-gradient(75%_60%_at_0%_0%,var(--ion-tint),transparent_72%)]"
        />
      ) : null}
      <figure className="flex h-full flex-col">
        <div aria-hidden="true" className={cn("flex flex-wrap items-center gap-x-[.6em] gap-y-1.5 font-mono text-hud-xs uppercase text-ink-3", compact && "xl:tracking-[.08em]")}>
          <span>INCOMING TRANSMISSION ·</span>
          <span>
            {t.rx} · {t.org}
          </span>
          <Waveform base={base} still={reduced} />
        </div>

        {featured ? (
          <FeaturedQuote quote={t.quote} highlight={t.highlight} base={base} still={reduced} />
        ) : (
          <PlainQuote quote={t.quote} highlight={t.highlight} base={base} still={reduced} />
        )}

        <figcaption
          className={cn(
            "mt-auto flex items-center gap-4",
            featured ? "pt-10 lg:pt-12" : "pt-8",
            compact && "xl:flex-col xl:items-start xl:gap-3"
          )}
        >
          <Picture
            image={photo}
            alt={t.name}
            sizes={featured ? "96px" : "48px"}
            className="block shrink-0"
            imgClassName={cn("rounded-full object-cover ring-1 ring-ion/40", featured ? "size-24" : "size-12")}
          />
          <div className="min-w-0">
            <p className="text-small font-semibold text-ink-1">{t.name}</p>
            <p className="text-small text-ink-2">
              {t.role}, {t.company}
            </p>
            <ExternalLink
              href={t.linkedin}
              srHint="(opens LinkedIn in a new tab)"
              className="mt-1 inline-block text-small coarse:inline-flex coarse:min-h-11 coarse:items-center"
            >
              LinkedIn<span className="sr-only"> profile of {t.name}</span>
            </ExternalLink>
          </div>
        </figcaption>
      </figure>
    </SpotlightCard>
  );
}
