/**
 * Fixed deep-field background (first paint on every page and the WebGL fallback):
 * three per-chapter atmosphere glows (opacity driven by body[data-chapter], see index.css)
 * and three CSS star tiles with a scroll-linked parallax on desktop (progressive enhancement).
 * There is no global WebGL; the Galaxy is hero-only.
 */
export default function SpaceBackground() {
  return (
    <div className="space-bg" aria-hidden="true">
      <div className="layer atmo atmo-nebula" data-glow />
      <div className="layer atmo atmo-ion" data-glow />
      <div className="layer atmo atmo-gold" data-glow />
      <div className="stars stars-a" /><div className="stars stars-b" /><div className="stars stars-c" />
    </div>
  );
}
