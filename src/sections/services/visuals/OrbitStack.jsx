import { useRef } from "react";
import StarGlyph from "@/components/ui/StarGlyph";
import useBrandIcons from "@/hooks/useBrandIcons";

// Spec 6.5, tile B. A 220 px square: inner ring r = 60 (clouds), outer ring r = 100 (data stores).
// Glyph names resolve against the lazily loaded brand icon map (useBrandIcons); the discs render at once.
const INNER = [
  { icon: "SiAmazonaws", deg: -90 },
  { icon: "SiGooglecloud", deg: 30 },
  { icon: "SiMicrosoftazure", deg: 150 },
];
const OUTER = [
  { icon: "SiMongodb", deg: -45 },
  { icon: "SiPostgresql", deg: 45 },
  { icon: "SiApachekafka", deg: 135 },
  { icon: "SiRedis", deg: 225 },
];

const at = (deg) => {
  const r = (deg * Math.PI) / 180;
  return { left: `${50 + 50 * Math.cos(r)}%`, top: `${50 + 50 * Math.sin(r)}%` };
};

function Satellites({ items, uprightClass, icons }) {
  return items.map(({ icon, deg }) => {
    const Icon = icons ? icons[icon] : null;
    return (
      <span key={deg} className="absolute -translate-x-1/2 -translate-y-1/2" style={at(deg)}>
        <span className={`${uprightClass} grid size-9 place-items-center rounded-full border border-line-strong bg-space-800 shadow-hi-top`}>
          {Icon ? <Icon size={20} className="text-ink-1/85" aria-hidden="true" focusable="false" /> : null}
        </span>
      </span>
    );
  });
}

/**
 * B. OrbitStack: cloud providers on the inner ring (spin 40 s), data stores on the outer ring (spin 64 s, reverse).
 * Icon wrappers counter-rotate with the same duration so they stay upright.
 * Reduced motion: icons at fixed angles. Pauses whenever `active` is false.
 */
export default function OrbitStack({ active = false }) {
  const rootRef = useRef(null);
  const icons = useBrandIcons(rootRef);
  return (
    <div ref={rootRef} className="svc-vis relative size-[220px] shrink-0" data-active={active ? "true" : "false"}>
      {/* Rings (static) */}
      <span className="absolute inset-[10px] rounded-full border border-orbit" />
      <span className="absolute inset-[50px] rounded-full border border-orbit" />

      {/* Core */}
      <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-line-strong bg-space-700 shadow-hi-top">
        <StarGlyph size={14} className="text-ion" />
        <span className="font-mono text-[10px] font-medium leading-none tracking-[0.16em] text-ink-1">DATA</span>
      </span>

      {/* Carriers (rotate) */}
      <span className="absolute inset-[10px] motion-ok:animate-spin-64-rev">
        <Satellites items={OUTER} uprightClass="svc-upright-64" icons={icons} />
      </span>
      <span className="absolute inset-[50px] motion-ok:animate-spin-40">
        <Satellites items={INNER} uprightClass="svc-upright-40" icons={icons} />
      </span>
    </div>
  );
}
