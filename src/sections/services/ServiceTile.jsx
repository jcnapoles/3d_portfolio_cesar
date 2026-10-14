import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { m } from "motion/react";
import { Plus } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Chip from "@/components/ui/Chip";
import StarGlyph from "@/components/ui/StarGlyph";
import CalendlyButton from "@/components/ui/CalendlyButton";
import { cn } from "@/lib/cn";
import { DUR, fadeUpScale } from "@/lib/motion";
import { isVerified, sttokMetricKey } from "@/constants/claims";
import { PROOF_COMPANIES } from "@/constants/services";
import useMotionPreference from "@/hooks/useMotionPreference";
import useInViewport from "@/hooks/useInViewport";
import usePrefersFinePointer from "@/hooks/usePrefersFinePointer";

const BURST_MS = 6000; // B, C, D: active for 6 s after first entering the view
const VISUAL_DELAY_MS = 120; // each micro-visual starts 120 ms after its tile has revealed

/** Proof line from claims.js: unverified numbers never reach the page. */
function composeProof(proof) {
  let text = proof.verifiedVariant && isVerified(proof.verifiedVariant.claim) ? proof.verifiedVariant.text : proof.base;
  for (const extra of proof.appendIfVerified ?? []) {
    if (extra.sttokMetric) {
      const key = sttokMetricKey();
      if (key && extra.sttokMetric[key]) text += extra.sttokMetric[key];
    } else if (isVerified(extra.claim)) {
      text += extra.text;
    }
  }
  return text;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const COMPANY_RE = new RegExp(`(${PROOF_COMPANIES.map(escapeRe).join("|")})`, "g");

/** Company names in text-ion. */
function highlightCompanies(text) {
  return text.split(COMPANY_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="whitespace-nowrap text-ion">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

/**
 * Drives a micro-visual: reveal timing, viewport visibility, the 6 s burst and hover / focus-within re-activation.
 * Returns `active` for the visual. A ("loop"): while the visual is in view. B, C, D ("burst"): for 6 s after the
 * visual first enters the view (>= 50 % visible), then again only while the tile is hovered / focus-within
 * (fine pointers). Never under reduced motion.
 */
function useVisualActivity({ mode, revealed, revealDelay, visualRef }) {
  const { reduced } = useMotionPreference();
  const fine = usePrefersFinePointer();

  // Ready: VISUAL_DELAY_MS after the tile's reveal has finished.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!revealed || ready) return undefined;
    const ms = reduced ? 0 : (DUR.reveal + revealDelay) * 1000 + VISUAL_DELAY_MS;
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [revealed, ready, reduced, revealDelay]);

  // Visibility of the visual itself.
  const [visible, setVisible] = useState(false);
  const [mostly, setMostly] = useState(false);
  useEffect(() => {
    const el = visualRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      setMostly(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        setMostly(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visualRef]);

  // Burst: once, the first time the ready visual is mostly in view.
  const [burst, setBurst] = useState(false);
  const burstStarted = useRef(false);
  const burstTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(burstTimer.current), []);
  useEffect(() => {
    if (mode !== "burst" || reduced || !ready || !mostly || burstStarted.current) return;
    burstStarted.current = true;
    setBurst(true);
    burstTimer.current = window.setTimeout(() => setBurst(false), BURST_MS);
  }, [mode, reduced, ready, mostly]);

  // Hover / focus-within (fine pointers only).
  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const handlers = {
    onPointerEnter: useCallback((e) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") setHover(true);
    }, []),
    onPointerLeave: useCallback(() => setHover(false), []),
    onFocus: useCallback(() => setFocusWithin(true), []),
    onBlur: useCallback((e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
    }, []),
  };
  const engaged = fine && (hover || focusWithin);

  const active = !reduced && ready && visible && (mode === "loop" || burst || engaged);
  return { active, handlers };
}

function Deliverables({ items }) {
  return (
    <details className="disclosure group/del mt-6 border-y border-line">
      <summary className="group/sum flex min-h-11 items-center justify-between gap-4 py-3 text-small font-semibold text-ink-1">
        <span>Deliverables ({items.length})</span>
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-ink-2 transition-colors duration-ui ease-ui group-hover/sum:border-ink-3 group-hover/sum:text-ink-1 group-open/del:border-ink-3 group-open/del:text-ink-1">
          <Plus size={14} strokeWidth={2} aria-hidden="true" className="motion-ok:transition-transform motion-ok:duration-ui motion-ok:ease-ui group-open/del:rotate-45" />
        </span>
      </summary>
      <ul className="pb-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 py-1.5 text-small text-ink-2">
            <StarGlyph size={8} className="mt-[0.45em] text-ink-3" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function CoreList({ items }) {
  return (
    <div className="mt-6">
      <p className="hud-label">You get</p>
      <ul className="mt-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 border-t border-line py-3 text-body text-ink-1 first:border-t-0">
            <StarGlyph size={10} className="mt-[0.5em] text-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Proof({ text }) {
  return (
    <div className="panel-blueprint mt-6 p-4">
      <p className="hud-label">Proof</p>
      <p className="mt-2 text-small text-ink-2">{highlightCompanies(text)}</p>
    </div>
  );
}

/* Layouts
   - feature (A): mobile stacked; md+: text left, visual right (full-width tile). On desktop the stage is a fixed
     320 px band, vertically centred on the copy; it clips the CommandNode's range rings.
   - stack (B, C): always stacked.
   - wide (D): mobile stacked; md+: text left, visual right. */
const LAYOUT = {
  feature: {
    card: "md:grid md:grid-cols-2 md:gap-x-8 lg:gap-x-12",
    header: "md:col-span-2",
    stage: "md:col-start-2 md:row-start-2 md:mt-0 md:self-center lg:h-[320px] lg:overflow-clip lg:rounded-md",
    body: "md:col-start-1 md:row-start-2",
  },
  stack: { card: "", header: "", stage: "", body: "flex-1" },
  wide: {
    card: "md:grid md:grid-cols-12 md:gap-x-8 lg:gap-x-12",
    header: "md:col-span-12",
    stage: "md:col-span-6 md:col-start-7 md:row-start-2 md:mt-0 md:self-center",
    body: "md:col-span-6 md:col-start-1 md:row-start-2",
  },
};

const STAGE = {
  feature: "flex items-center justify-center",
  stack: "flex h-[232px] items-center justify-center",
  wide: "flex items-center justify-center py-2",
};

/**
 * One Services tile (spec 6.5 tile anatomy) on a SpotlightCard. Tile A is `featured` (comet border, HudFrame,
 * CORE OFFER, gold-star list); B, C, D put their deliverables in a native <details class="disclosure">.
 */
export default function ServiceTile({
  service,
  index,
  Visual,
  layout = "stack",
  mode = "burst",
  revealDelay = 0,
  className,
  stageClassName,
  visualClassName,
}) {
  const { reduced } = useMotionPreference();
  const wrapRef = useRef(null);
  const visualRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const titleId = `svc-${service.key}-title-${uid}`;

  const revealed = useInViewport(wrapRef, { once: true, attr: false });
  const variants = useMemo(() => fadeUpScale({ delay: revealDelay }), [revealDelay]);
  const { active, handlers } = useVisualActivity({ mode, revealed, revealDelay, visualRef });
  const proofText = useMemo(() => composeProof(service.proof), [service.proof]);
  const L = LAYOUT[layout] ?? LAYOUT.stack;

  return (
    <m.div
      ref={wrapRef}
      className={cn("min-w-0", className)}
      variants={variants}
      initial={reduced ? false : "hidden"}
      animate={reduced || revealed ? "show" : "hidden"}
      {...handlers}
    >
      <SpotlightCard
        featured={!!service.featured}
        aria-labelledby={titleId}
        className={cn("flex h-full flex-col", L.card)}
      >
        <header className={cn("flex min-h-7 items-center justify-between gap-3", L.header)}>
          <span className="hud-label" aria-hidden="true">
            S/{String(index + 1).padStart(2, "0")}
          </span>
          {service.featured ? (
            <Chip tone="gold" className="text-[11px] uppercase leading-none tracking-[0.14em]">
              Core offer
            </Chip>
          ) : null}
        </header>

        <div ref={visualRef} aria-hidden="true" className={cn("svc-stage mt-6", STAGE[layout], L.stage, stageClassName)}>
          <div className={cn("relative w-full", visualClassName)}>
            <Visual active={active} />
          </div>
        </div>

        <div className={cn("mt-6 flex flex-col", L.body)}>
          <h3 id={titleId} className="text-h3 stretch-105 text-ink-1">
            {service.title}
          </h3>
          <p className="mt-3 text-body text-ink-2">
            <span className="text-ink-1">For:</span> {service.for}
          </p>

          {service.featured ? <CoreList items={service.get} /> : <Deliverables items={service.get} />}

          <Proof text={proofText} />

          <div className="mt-auto pt-6">
            <CalendlyButton variant="text" placement={service.placement} label={service.cta} />
          </div>
        </div>
      </SpotlightCard>
    </m.div>
  );
}
