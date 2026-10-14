import { useEffect, useRef, useState } from "react";
import Eclipse from "@/components/ui/Eclipse";
import OrbitRing from "@/components/ui/OrbitRing";
import Picture from "@/components/ui/Picture";
import { heroPortrait } from "@/assets/media";
import { HERO_COPY } from "@/constants/hero";
import { BACK_HALF, ringBox, ringProps, useDiscSize } from "@/sections/hero/orbit";

// The trimmed cut-out is nearly square (880 x 860), so at width = disc it is lifted 9 % to break the top of the frame.
const LIFT = 0.09;
const RATIO = heroPortrait.height / heroPortrait.width;
const CUTOUT = heroPortrait.mode !== "circle";
// Matches --p in contact.css: clamp(190px, 24vw, 300px).
const SIZES = "(min-width: 1250px) 300px, (min-width: 792px) 24vw, 190px";

/**
 * Hides the satellite where it passes BEHIND the portrait (back half of the orbit, inside the cut-out's alpha).
 * Uses the <img>'s currentSrc so it is always a cache hit. Without mask-composite support it simply stays visible.
 */
function silhouetteMask(src, d, box) {
  if (!src || !CUTOUT) return undefined;
  return {
    maskImage: `linear-gradient(#000 0 0), url("${src}"), ${BACK_HALF}`,
    maskSize: `100% 100%, ${d}px ${RATIO * d}px, 100% 100%`,
    maskPosition: `0 0, ${-box.left}px ${-LIFT * d - box.top}px, 0 0`,
    maskRepeat: "no-repeat",
    maskComposite: "exclude, intersect",
  };
}

function useLoadedSrc(imgRef) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return undefined;
    const done = () => {
      if (img.naturalWidth > 0) setSrc(img.currentSrc || img.src);
    };
    if (img.complete) done();
    img.addEventListener("load", done);
    return () => img.removeEventListener("load", done);
  }, [imgRef]);
  return src;
}

/**
 * 10a launch window visual: Cesar's portrait cut-out framed the way the hero used to frame it (disc, gold/ion rim
 * light, orbit with the gold satellite), in front of an eclipse afterglow: the disc is the moon of an ambient
 * Eclipse whose corona haloes him. Lazy-loaded (it is far below the fold).
 *
 * props: eclipseRef (Eclipse handle: flare() on a successful send), active (primary CTA hovered or focused:
 * the corona brightens through data-cta-active).
 */
export default function LaunchPortrait({ eclipseRef, active = false }) {
  const rootRef = useRef(null);
  const imgRef = useRef(null);
  const d = useDiscSize(rootRef, 240);
  const loadedSrc = useLoadedSrc(imgRef);

  const box = ringBox(d);
  const rp = ringProps(d);
  const boxStyle = { left: box.left, top: box.top, width: box.width, height: box.height };

  return (
    <div className="launch-stage">
      <div ref={rootRef} className="launch-portrait relative aspect-square w-[var(--p)] shrink-0">
        {/* Soft afterglow behind everything (static). */}
        <div aria-hidden="true" data-glow className="launch-afterglow pointer-events-none absolute left-1/2 top-1/2" />

        {/* Eclipse afterglow: corona + the disc (moon) + the 10 o'clock diamond star. */}
        <Eclipse ref={eclipseRef} variant="ambient" size="var(--p)" active={active} className="absolute inset-0" />

        {/* Back half of the orbit, under the portrait. */}
        <div aria-hidden="true" className="pointer-events-none absolute" style={boxStyle}>
          <OrbitRing {...rp} part="back" className="absolute inset-0" />
        </div>

        {CUTOUT ? (
          <Picture
            ref={imgRef}
            image={heroPortrait}
            alt={HERO_COPY.portraitAlt}
            sizes={SIZES}
            draggable={false}
            className="absolute inset-x-0 top-[-9%] block"
            imgClassName="launch-portrait-img mask-fade-b block h-auto w-full select-none"
          />
        ) : (
          <div className="absolute inset-0 overflow-clip rounded-full">
            <Picture
              image={heroPortrait}
              alt={HERO_COPY.portraitAlt}
              sizes={SIZES}
              draggable={false}
              className="block size-full"
              imgClassName="block size-full select-none object-cover object-top"
            />
          </div>
        )}

        {/* Front half of the orbit + the satellite, over the portrait. */}
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ ...boxStyle, ...silhouetteMask(loadedSrc, d, box) }}>
          <OrbitRing {...rp} part="front" satellite className="absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
