// The single source of gated numbers. Cesar flips `verified` here, nowhere else.
// Numbers that are not yet confirmed default to verified:false and render their fallback.
export const FACTS = {
  yearsShipping: { value: 12, suffix: "+", label: "years shipping production software", source: "Since 2012" },
  sttokUsers: { value: 250000, format: { notation: "compact" }, suffix: "+", display: "250K+", label: "users the Sttok platform was re-architected for", source: "Sttok · 2024–25", href: "#mission-sttok" },
};
export const CLAIMS = {
  // Confirmed by Cesar (Oct 2026), together with fiatcAdoption and isernUptime; also added to the CV.
  sttokP95: { verified: true, value: -70, suffix: "%", display: "−70%", label: "p95 query latency", source: "Sttok · MongoDB Atlas", href: "#mission-sttok" },
  // Verified against the CV (page 2): TCO projections "reducing projected infrastructure spend by 30%".
  sttokInfraSpend: { verified: true, value: -30, suffix: "%", display: "−30%", label: "projected infrastructure spend (AWS TCO analysis)", source: "Sttok · AWS migration", href: "#mission-sttok" },
  fiatcAdoption: { verified: true, value: 45, prefix: "+", suffix: "%", display: "+45%", label: "internal adoption after the intranet migration", source: "FIATC Seguros", href: "#mission-fiatc" },
  isernUptime: { verified: true, value: 99.5, suffix: "%", display: "99.5%", label: "system uptime after modernization", source: "Isern", href: "#mission-isern" },
};
// FIATC sits second so the telemetry band's two claim cells are not both Sttok (it already shows 250K+ users).
export const CLAIM_PRIORITY = ["sttokP95", "fiatcAdoption", "sttokInfraSpend", "isernUptime"];
export const isVerified = (key) => CLAIMS[key]?.verified === true;
export const verifiedClaims = () => CLAIM_PRIORITY.filter(isVerified).map((k) => ({ key: k, ...CLAIMS[k] }));
/** The single Sttok metric to show where only one fits: sttokP95 when verified, else sttokInfraSpend (when verified), else null. */
export const sttokMetricKey = () => (isVerified("sttokP95") ? "sttokP95" : isVerified("sttokInfraSpend") ? "sttokInfraSpend" : null);
export const AVAILABILITY = { show: true, text: "Open to new fractional CTO engagements" };
