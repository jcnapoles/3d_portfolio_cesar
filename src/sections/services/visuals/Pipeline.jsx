import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import useMotionPreference from "@/hooks/useMotionPreference";

// Spec 6.5, tile C. Four mono nodes on a 4-column grid: centers at 12.5 / 37.5 / 62.5 / 87.5 %.
const STAGES = ["BUILD", "TEST", "REVIEW", "DEPLOY"];
const ROW = "flex flex-col items-center gap-3";
const DOT_Y = "top-[13px]"; // indicator center (26 px circle)

function Indicator({ on }) {
  return on ? (
    <span className="relative grid size-[26px] place-items-center rounded-full border border-signal/50 bg-space-800">
      <span className="absolute inset-0 rounded-full bg-[var(--signal-tint)]" />
      <Check size={13} strokeWidth={2.5} className="relative text-signal" aria-hidden="true" />
    </span>
  ) : (
    <span className="grid size-[26px] place-items-center rounded-full border border-line-strong bg-space-800">
      <span className="size-1 rounded-full bg-ink-3" />
    </span>
  );
}

function Label({ on, children }) {
  return <span className={`font-mono text-hud-xs ${on ? "text-signal" : "text-ink-3"}`}>{children}</span>;
}

/**
 * C. Pipeline: an ion pulse runs BUILD > TEST > REVIEW > DEPLOY in 4 s; each node turns signal green with a Check
 * when the pulse lands (25 / 50 / 75 / 100 %). When `active` turns false the current run finishes (pause on the
 * next cycle edge, where every node is checked), so a resting pipeline always reads "deployed".
 * Reduced motion: all nodes checked, no pulse.
 */
export default function Pipeline({ active = false }) {
  const { reduced } = useMotionPreference();
  const carrierRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (active && !reduced) {
      setRunning(true);
      return undefined;
    }
    if (!running) return undefined;
    const el = carrierRef.current;
    if (reduced || !el) {
      setRunning(false);
      return undefined;
    }
    // Finish the current run: the next iteration edge holds every node checked (0-8 % of the cycle).
    const stop = () => setRunning(false);
    el.addEventListener("animationiteration", stop, { once: true });
    return () => el.removeEventListener("animationiteration", stop);
  }, [active, reduced, running]);

  return (
    <div className="svc-vis svc-pipe relative w-full" data-active={running ? "true" : "false"}>
      {/* Input stub, connector and pulse track (below the nodes). */}
      <span className={`absolute left-0 ${DOT_Y} h-px w-[12.5%] bg-gradient-to-r from-transparent to-[var(--line-strong)]`} />
      <span className={`absolute inset-x-[12.5%] ${DOT_Y} h-px bg-line-strong`} />
      <span className={`absolute inset-x-0 ${DOT_Y} h-0 overflow-x-clip`}>
        <span ref={carrierRef} className="svc-pipe-carrier absolute inset-x-0 top-0 h-0">
          <span className="svc-pipe-head absolute left-0 top-0">
            <span className="absolute right-[3px] top-[-0.5px] h-px w-8 bg-gradient-to-l from-ion/70 to-transparent" />
            <span className="absolute -left-[3px] -top-[3px] size-1.5 rounded-full bg-ion shadow-glow-ion" />
          </span>
        </span>
      </span>

      <ol className="relative grid grid-cols-4">
        {STAGES.map((stage, i) => (
          <li key={stage} className={`relative ${ROW}`}>
            <Indicator on={false} />
            <Label on={false}>{stage}</Label>
            <span className={`svc-pipe-on svc-pipe-on-${i} absolute inset-0 ${ROW}`}>
              <Indicator on />
              <Label on>{stage}</Label>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
