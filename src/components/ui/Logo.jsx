import { cn } from "@/lib/cn";
import StarGlyph from "@/components/ui/StarGlyph";

/** Brand lockup: gold First Light star + "Cesar Napoles" + optional FRACTIONAL CTO sub-label. Wrap it in a link where needed. */
export default function Logo({ className, showSub = true }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <StarGlyph size={18} className="text-gold" />
      <span className="flex flex-col">
        <span className="whitespace-nowrap text-[15px] font-semibold leading-[1.1] tracking-[-0.01em] text-ink-1">Cesar Napoles</span>
        {showSub ? <span className="mt-1 whitespace-nowrap font-mono text-hud-xs uppercase leading-none text-ink-3">Fractional CTO</span> : null}
      </span>
    </span>
  );
}
