// AI-native delivery band (#delivery, chapter 00, right under the telemetry numbers): how Cesar runs engineering as
// fractional CTO at Cashela and 1234ticket. Owner's call (Oct 2026): no figures here, text only, and no repository
// volumes (commit counts, workflow counts). Public-safe wording, as in career.js: no provider names.
// `logo` is a key of companyLogos in src/assets/media.js.

export const DELIVERY_COPY = {
  name: "AI-NATIVE DELIVERY",
  // Short enough to share the HUD row with the name at 375 px (the clients are named right below).
  hudRight: "2 CLIENTS",
  eyebrow: "How I run engineering today",
  title: "AI builds. Experts decide. Every change is tested.",
  lead:
    "The delivery model I run as fractional CTO at Cashela and 1234ticket: AI agents do the implementation, senior engineers own every decision, and automated QA guards every release.",
};

export const DELIVERY_CLIENTS = [
  { key: "cashela", logo: "cashelaLogo", meta: "Fintech · Fractional CTO since 2025" },
  { key: "1234ticket", logo: "1234ticketLogo", meta: "Ticketing · Fractional CTO since 2026" },
];

/** The loop, in order. `kind` sets the badge colour: expert (gold), ai (ion), qa (signal). */
export const DELIVERY_STEPS = [
  { n: "01", kind: "expert", badge: "Expert", title: "Scope", body: "A senior engineer defines the change, its architecture constraints and the acceptance criteria." },
  { n: "02", kind: "ai", badge: "AI", title: "Implement", body: "AI agents write the code, tests and docs against the team's conventions, one branch per issue." },
  { n: "03", kind: "qa", badge: "Automated", title: "Verify", body: "Automated QA runs on every pull request: test suites plus architecture and payment-safety guards in CI." },
  { n: "04", kind: "expert", badge: "Expert", title: "Review & ship", body: "An engineer reviews and owns the merge; new features go out behind feature flags." },
];

/** Outcomes, without numbers: `trend` draws the arrow, `sr` is what a screen reader hears for the value. */
export const DELIVERY_OUTCOMES = [
  { key: "revenue", trend: "up", value: "Revenue", sr: "More revenue", label: "Delivery capacity goes to the revenue path: checkout, payment links and partner sales." },
  { key: "manual", trend: "down", value: "Manual work", sr: "Less manual work", label: "Reconciliation, deploys, backups and release checks run automatically instead of by hand." },
  { key: "speed", trend: "up", value: "Delivery speed", sr: "Faster delivery", label: "AI carries the implementation load, so engineers spend their time on decisions and review." },
  { key: "risk", trend: "down", value: "Release risk", sr: "Lower release risk", label: "Automated QA and feature flags catch problems before customers do." },
];

export const DELIVERY_CAPTION = "Cashela · 1234ticket";
