export const SITE_URL = "https://cesarnapoles.com";
export const PERSON = {
  name: "Cesar Napoles",
  role: "Fractional CTO",
  location: "Tarragona, Spain",
  workMode: "Remote & hybrid",
  timeZone: "Europe/Madrid",
  coords: [41.1189, 1.2445],
};
export const LINKS = {
  calendly: "https://calendly.com/cesarnapoles/30min",
  linkedin: "https://linkedin.com/in/jcnapoles",
  github: "https://github.com/jcnapoles",
  cv: "/Cesar_Napoles_CV.pdf",
  closevibe: "https://www.closevibe.com/",
};
export const CV_LABEL = "Download CV (PDF, 353 KB)";
export const PLACEMENTS = ["nav", "menu", "hero", "fit", "svc-fcto", "svc-arch", "svc-lead", "svc-build", "svc-unsure", "results", "process", "testimonials", "about", "faq", "launch", "contact", "footer", "sticky"];
export const calendlyUrl = (placement) =>
  `${LINKS.calendly}?utm_source=site&utm_medium=cta&utm_content=${encodeURIComponent(placement)}`;
export const NAV_OFFSET = 88;
export const CHAPTERS = [
  { index: "00", name: "LAUNCH", id: "top", label: "Launch" },
  { index: "01", name: "BRIEFING", id: "fit", label: "Briefing" },
  { index: "02", name: "FLIGHT MODES", id: "services", label: "Services" },
  { index: "03", name: "MISSIONS", id: "results", label: "Results" },
  { index: "04", name: "FLIGHT PLAN", id: "process", label: "Process" },
  { index: "05", name: "TRANSMISSIONS", id: "testimonials", label: "Testimonials" },
  { index: "06", name: "TRAJECTORY", id: "about", label: "About" },
  { index: "07", name: "FLEET", id: "builds", label: "Builds" },
  { index: "08", name: "SYSTEMS", id: "stack", label: "Stack" },
  { index: "09", name: "PRE-FLIGHT CHECKS", id: "faq", label: "FAQ" },
  { index: "10", name: "OPEN CHANNEL", id: "contact", label: "Contact" },
];
export const NAV_LINKS = [
  { id: "services", label: "Services", chapter: "02" },
  { id: "results", label: "Results", chapter: "03" },
  { id: "process", label: "Process", chapter: "04" },
  { id: "testimonials", label: "Testimonials", chapter: "05" },
  { id: "about", label: "About", chapter: "06" },
];
export const ANCHORS = {
  heroCta: "hero-cta",
  contactForm: "contact-form",
  missions: { sttok: "mission-sttok", fiatc: "mission-fiatc", flyr: "mission-flyr", isern: "mission-isern", closevibe: "mission-closevibe" },
};
// Verified in Phase F step 9 against the injected widget DOM.
export const CLOSEVIBE_ROOT_SELECTOR = '[id^="closevibe"], [class*="closevibe"], [id^="cv-"]';
