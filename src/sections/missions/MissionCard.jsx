import { createContext, memo, useContext, useEffect, useId, useMemo, useRef } from "react";
import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { DUR, EASE, SPRING } from "@/lib/motion";
import MissionPatch from "@/components/ui/MissionPatch";
import Picture from "@/components/ui/Picture";
import ExternalLink from "@/components/ui/ExternalLink";
import NumberTicker from "@/components/ui/NumberTicker";
import useMotionPreference from "@/hooks/useMotionPreference";
import { CLAIMS, isVerified } from "@/constants/claims";
import { testimonialPhotos } from "@/assets/media";
import SttokDiagram from "./diagrams/SttokDiagram";
import FiatcDiagram from "./diagrams/FiatcDiagram";
import FlyrDiagram from "./diagrams/FlyrDiagram";
import IsernDiagram from "./diagrams/IsernDiagram";
import ClosevibeDiagram from "./diagrams/CloseviveDiagram";

const DIAGRAMS = { sttok: SttokDiagram, fiatc: FiatcDiagram, flyr: FlyrDiagram, isern: IsernDiagram, closevibe: ClosevibeDiagram };

/* ------------------------------------------------------------------------------------------------
 * Diagram primitives (viewBox 0 0 560 400). Passed to every diagram as the `fig` prop, so the five
 * diagram files stay pure layout and nothing imports back from this file.
 * - Stroke: a path revealed by a Motion pathLength draw (1.2 s, EASE.draw, once). The draw runs on a
 *   mask, so dashed and solid strokes draw the same way and keep a crisp 1 px non-scaling stroke.
 * - Node: m.g scale .6 -> 1 on SPRING.lock (callers stagger by 80 ms).
 * - Label / Pop: HTML overlays positioned in viewBox units (mono labels keep their px size on mobile).
 * - Satellite: one gold SMIL satellite on the diagram's target orbit; parked under reduced motion.
 * Under reduced motion everything renders in its final state with no Motion props at all.
 * ---------------------------------------------------------------------------------------------- */
const FigContext = createContext({ reduced: false });

const STROKES = {
  hud: "var(--hud)",
  dim: "var(--hud-dim)",
  gold: "var(--gold)",
  ion: "var(--ion)",
  line: "var(--line-strong)",
};

const drawVariants = (delay) => ({
  hidden: { pathLength: 0 },
  show: { pathLength: 1, transition: { duration: DUR.draw, ease: EASE.draw, delay } },
});
const popVariants = (delay) => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { scale: { ...SPRING.lock, delay }, opacity: { duration: DUR.ui, ease: EASE.out, delay } },
  },
});
const fadeVariants = (delay) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.panel, ease: EASE.out, delay } },
});

const toId = (prefix, raw) => `${prefix}${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;

/** Closed ellipse path starting at the left point, travelling the bottom (front) half first. */
const ellipse = (cx, cy, rx, ry) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
/** Point on an ellipse at `deg` (0 = right, 90 = bottom; SVG y-down). */
const onEllipse = (cx, cy, rx, ry, deg) => {
  const a = (deg * Math.PI) / 180;
  return { x: +(cx + rx * Math.cos(a)).toFixed(2), y: +(cy + ry * Math.sin(a)).toFixed(2) };
};
const pct = (x, y) => ({ left: `${(x / 560) * 100}%`, top: `${(y / 400) * 100}%` });

function Stroke({ d, delay = 0, tone = "hud", width = 1, dash, opacity, linecap = "round" }) {
  const { reduced } = useContext(FigContext);
  const maskId = toId("fm", useId());
  const path = (
    <path
      d={d}
      fill="none"
      stroke={STROKES[tone] || STROKES.hud}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeOpacity={opacity}
      strokeLinecap={linecap}
      vectorEffect="non-scaling-stroke"
      mask={reduced ? undefined : `url(#${maskId})`}
    />
  );
  if (reduced) return path;
  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-40" y="-40" width="640" height="480">
        <m.path d={d} fill="none" stroke="white" strokeWidth="18" variants={drawVariants(delay)} />
      </mask>
      {path}
    </>
  );
}

function Node({ x, y, delay = 0, tone = "ion", r = 3.5, ring = 8.5 }) {
  const { reduced } = useContext(FigContext);
  const content = (
    <>
      <circle cx={x} cy={y} r={ring} fill="var(--space-900)" stroke="var(--hud)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle cx={x} cy={y} r={r} fill={tone === "gold" ? "var(--gold)" : "var(--ion)"} />
    </>
  );
  if (reduced) return <g>{content}</g>;
  return <m.g variants={popVariants(delay)}>{content}</m.g>;
}

const LABEL_TONES = { muted: "text-ink-3", ion: "text-ion", ink: "text-ink-2" };
const TX = { start: "0%", middle: "-50%", end: "-100%" };
const TY = { below: "0%", center: "-50%", above: "-100%" };

/** Mono HUD label at viewBox (x, y). anchor: start | middle | end; place: above | center | below. */
function Label({ x, y, anchor = "middle", place = "center", tone = "muted", delay = 0, children }) {
  const { reduced } = useContext(FigContext);
  const Tag = reduced ? "span" : m.span;
  return (
    <span
      className="pointer-events-none absolute whitespace-nowrap"
      style={{ ...pct(x, y), transform: `translate(${TX[anchor]}, ${TY[place]})` }}
    >
      <Tag
        className={cn(
          "block font-mono text-[9px] font-medium uppercase leading-none tracking-[0.1em] sm:text-[11px] sm:tracking-[0.12em]",
          LABEL_TONES[tone] || LABEL_TONES.muted
        )}
        {...(reduced ? {} : { variants: fadeVariants(delay) })}
      >
        {children}
      </Tag>
    </span>
  );
}

/** HTML element centred on viewBox (x, y) that pops in like a node (scale .6 -> 1). */
function Pop({ x, y, delay = 0, className, children }) {
  const { reduced } = useContext(FigContext);
  const Tag = reduced ? "span" : m.span;
  return (
    <span className="absolute" style={{ ...pct(x, y), transform: "translate(-50%, -50%)" }}>
      <Tag className={cn("block", className)} {...(reduced ? {} : { variants: popVariants(delay) })}>
        {children}
      </Tag>
    </span>
  );
}

/** HTML block that fades in (used for the Closevibe screenshot). Position it with a plain wrapper:
 *  Motion owns this node's style, so it never carries a positioning transform. */
function Fade({ delay = 0, className, children }) {
  const { reduced } = useContext(FigContext);
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <m.div className={className} variants={fadeVariants(delay)}>
      {children}
    </m.div>
  );
}

/**
 * The single gold satellite on a target orbit `d`. Runs only while its diagram is active (DiagramPanel
 * pauses every other SMIL clock); it fades in once the orbit has drawn. Motion owns the wrapper's
 * opacity, CSS (.mission-sat, active gating) owns the satellite group's.
 * The glow is a radial-gradient halo drawn in SVG, never a CSS filter: a drop-shadow() on an element moved by
 * SMIL inside a transformed (sticky-stack) card forces filter regions / re-rasters every frame and was the
 * suspected source of a stray translucent rectangle seen in QA. Plain fills are cheap and cannot leave one.
 */
function SatelliteBody({ glowId }) {
  return (
    <>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="var(--gold-hot)" stopOpacity="0.85" />
          <stop offset="35%" stopColor="var(--gold)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="mission-sat-halo" r="11" fill={`url(#${glowId})`} />
      <circle r="3.4" fill="var(--gold)" />
    </>
  );
}

function Satellite({ d, park, dur = 16, delay = 1.2 }) {
  const { reduced } = useContext(FigContext);
  const uid = useId();
  const pathId = toId("fs", uid);
  const glowId = toId("fg", uid);
  if (reduced) {
    return (
      <g className="mission-sat" transform={`translate(${park.x} ${park.y})`}>
        <SatelliteBody glowId={glowId} />
      </g>
    );
  }
  return (
    <>
      <path id={pathId} d={d} fill="none" stroke="none" />
      <m.g variants={fadeVariants(delay)}>
        <g className="mission-sat">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate="0">
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <SatelliteBody glowId={glowId} />
        </g>
      </m.g>
    </>
  );
}

const FIG = { Stroke, Node, Label, Pop, Fade, Satellite, ellipse, onEllipse };

/** Blueprint panel: 16:10 stage + caption row below it (< 1024); 7:5 panel with the caption bottom-left (>= 1024). */
function DiagramPanel({ mission, active }) {
  const { reduced } = useMotionPreference();
  const svgRef = useRef(null);
  const Diagram = DIAGRAMS[mission.diagram];
  const ctx = useMemo(() => ({ reduced }), [reduced]);

  // Only the active card's satellite runs; every other diagram's SMIL clock is paused.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    if (active && !reduced) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [active, reduced]);

  if (!Diagram) return null;
  return (
    <figure
      className="mission-fig panel-blueprint relative lg:aspect-[7/5]"
      data-active={active && !reduced ? "true" : "false"}
    >
      <div className="mission-fig-stage relative aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
        <FigContext.Provider value={ctx}>
          <m.div
            key={reduced ? "static" : "motion"}
            role="img"
            aria-label={mission.diagramAlt}
            className="mission-fig-box"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true, amount: 0.35 }}
          >
            <Diagram svgRef={svgRef} fig={FIG} />
          </m.div>
        </FigContext.Provider>
      </div>
      <figcaption className="px-4 pb-3 pt-1 font-mono text-hud-xs uppercase text-ink-3 lg:absolute lg:bottom-4 lg:left-5 lg:p-0">
        {mission.diagramCaption}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Card content
 * ---------------------------------------------------------------------------------------------- */

/** Splits a display string into its figure and a trailing unit ("250K+" -> ["250K", "+"]). */
function splitUnit(display) {
  const match = /^(.*?)([%+]+)$/.exec(display || "");
  return match ? [match[1], match[2]] : [display, ""];
}

function Result({ mission }) {
  const { metric, fallbackMetric, changed } = mission;
  const claim = metric && isVerified(metric.claim) ? CLAIMS[metric.claim] : null;
  const statClass = "text-stat stretch-112 text-ink-1";
  const labelClass = "max-w-[30ch] pb-[0.3em] font-mono text-[13px] leading-[1.45] text-ink-2";

  let stat = null;
  if (claim) {
    // Negative values: the sign travels as a typographic minus (U+2212) prefix, so the static text and
    // the NumberFlow roll show the same glyph (Intl would emit an ASCII hyphen-minus while animating).
    const negative = claim.value < 0;
    stat = (
      <p className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
        <span className={statClass}>
          <NumberTicker
            value={negative ? Math.abs(claim.value) : claim.value}
            prefix={negative ? `−${claim.prefix ?? ""}` : claim.prefix}
          />
          <span className="text-ion">{claim.suffix}</span>
        </span>
        <span className={labelClass}>{metric.label}</span>
      </p>
    );
  } else if (fallbackMetric) {
    const [figure, unit] = splitUnit(fallbackMetric.display);
    stat = (
      <p className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
        <span className={cn(statClass, "tabular")}>
          {figure}
          {unit ? <span className="text-ion">{unit}</span> : null}
        </span>
        <span className={labelClass}>
          {fallbackMetric.href ? (
            <ExternalLink href={fallbackMetric.href} className="coarse:-my-3 coarse:inline-block coarse:py-3">
              {fallbackMetric.label}
            </ExternalLink>
          ) : (
            fallbackMetric.label
          )}
        </span>
      </p>
    );
  }

  return (
    <div>
      <h4 className="hud-label">Result</h4>
      {stat}
      <p className={cn("text-body text-ink-1", stat ? "mt-4" : "mt-2")}>{changed}</p>
    </div>
  );
}

function Quote({ quote }) {
  const photo = testimonialPhotos[quote.photo];
  return (
    <figure className="flex gap-4 border-t border-line pt-6 lg:col-span-2" data-quote="">
      {photo ? (
        <Picture
          image={photo}
          alt=""
          sizes="40px"
          className="block size-10 shrink-0"
          imgClassName="size-10 rounded-full object-cover ring-1 ring-line-strong"
        />
      ) : null}
      <div className="min-w-0">
        <blockquote className="text-small text-ink-1">
          <p>{quote.text}</p>
        </blockquote>
        <figcaption className="mt-2 text-small text-ink-3">
          <span className="font-medium text-ink-2">{quote.name}</span>, {quote.role}
          <span aria-hidden="true" className="px-2">
            ·
          </span>
          <ExternalLink
            href={quote.linkedin}
            srHint="(opens LinkedIn in a new tab)"
            className="whitespace-nowrap coarse:-my-3 coarse:inline-block coarse:py-3"
          >
            LinkedIn
          </ExternalLink>
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * One mission file. In sticky-stack mode the card scales down (origin top) and dims as later cards
 * cover it, both driven by the list's scroll progress (Motion is the only engine on these nodes).
 */
const MissionCard = memo(function MissionCard({ mission, index, total, progress, stacked, active }) {
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - index) * 0.03]);
  const dim = useTransform(progress, [start, 1], [0, Math.min((total - 1 - index) * 0.12, 0.5)]);
  const titleId = `${mission.id}-title`;
  const Article = stacked ? m.article : "article";
  const hasQuote = Boolean(mission.quote);

  return (
    <Article
      aria-labelledby={titleId}
      data-cursor="lock"
      className="mission-card rounded-lg p-5 sm:p-7 md:rounded-xl lg:p-10"
      style={stacked ? { scale, transformOrigin: "50% 0" } : undefined}
    >
      <div
        className={cn(
          "mission-body flex flex-1 flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 lg:gap-y-8",
          hasQuote && "lg:grid-rows-[1fr_auto]"
        )}
      >
        {/* Left column (>= 1024): header, challenge, what I did. Below 1024 the wrappers dissolve
            (display: contents) so the diagram can sit above the text. */}
        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-7" data-col="">
          <header className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <MissionPatch code={mission.code} years={mission.years} className="size-16 lg:size-[72px]" />
              {/* HUD readout (CLIENT · {COMPANY} / {PERIOD} / ROLE · {ROLE}), one fact per line so narrow
                  columns never wrap mid-phrase or leave a dangling separator. */}
              <p className="min-w-0 font-mono text-hud-xs uppercase leading-[1.75] text-ink-3">
                <span className="block">
                  {mission.metaLabel || "Client"} · <span className="text-ink-2">{mission.company}</span>
                  <span className="sr-only">,</span>
                </span>
                <span className="tabular block whitespace-nowrap text-ink-2">
                  {mission.period}
                  <span className="sr-only">,</span>
                </span>
                <span className="block">
                  Role · <span className="text-ink-2">{mission.role}</span>
                </span>
              </p>
            </div>
            <h3 id={titleId} className="text-h3 text-ink-1">
              {mission.title}
            </h3>
          </header>

          <div>
            <h4 className="hud-label">Challenge</h4>
            <p className="mt-2 text-body text-ink-2">{mission.challenge}</p>
          </div>

          <div>
            <h4 className="hud-label">What I did</h4>
            <ul className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {mission.did.map((item) => (
                <li key={item} className="border-t border-line-strong pt-3 text-small text-ink-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column (>= 1024): diagram panel, then the result. */}
        <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-7" data-col="">
          <div className="order-first lg:order-none">
            <DiagramPanel mission={mission} active={active} />
          </div>
          <Result mission={mission} />
        </div>

        {hasQuote ? <Quote quote={mission.quote} /> : null}
      </div>

      {stacked ? (
        <m.div
          aria-hidden="true"
          className="mission-dim pointer-events-none absolute inset-0 rounded-[inherit] bg-void"
          style={{ opacity: dim }}
        />
      ) : null}
    </Article>
  );
});

export default MissionCard;
