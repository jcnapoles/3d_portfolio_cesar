/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      screens: { xs: "450px" },
      colors: {
        void: "#05060A",
        space: { 600: "#1E2333", 700: "#161A27", 800: "#10131D", 900: "#0A0C14" },
        line: { DEFAULT: "rgba(237, 238, 243, 0.08)", strong: "rgba(237, 238, 243, 0.14)", input: "#626879" },
        orbit: { DEFAULT: "rgba(116, 212, 255, 0.28)", dim: "rgba(116, 212, 255, 0.12)" },
        ink: { 1: "#EDEEF3", 2: "#A1A6B4", 3: "#878C9C" },
        gold: { DEFAULT: "#F4B860", hot: "#FFD08A", deep: "#C98A2E" },
        ion: "#74D4FF",
        signal: "#3DDC97",
        danger: "#FF8A7A",
        nebula: "#2B3A8C",
        // Legacy (2024) site only: src/legacy/** (lazy chunk). Never use these in the 2026 site.
        primary: "#050816",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
      },
      fontFamily: {
        sans: ['"Mona Sans Variable"', '"Mona Sans Fallback"', "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "Arial", "sans-serif"],
        mono: ['"Geist Mono Variable"', '"Geist Mono Fallback"', "ui-monospace", '"SFMono-Regular"', '"Cascadia Mono"', "Consolas", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 1.2rem + 6.2vw, 7.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em", fontWeight: "640" }],
        "display-l": ["clamp(2.5rem, 1rem + 5vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em", fontWeight: "620" }],
        "display-s": ["clamp(1.5rem, 1rem + 1.6vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
        h2: ["clamp(2.125rem, 1rem + 3.6vw, 4rem)", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "600" }],
        h3: ["clamp(1.375rem, 1rem + 1.2vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        h4: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        stat: ["clamp(3rem, 1.5rem + 4vw, 5.5rem)", { lineHeight: "0.9", letterSpacing: "-0.04em", fontWeight: "600" }],
        "stat-text": ["clamp(1.75rem, 1.2rem + 1.6vw, 2.75rem)", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "600" }],
        quote: ["clamp(1.5rem, 1rem + 1.4vw, 2.25rem)", { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "500" }],
        lead: ["clamp(1.125rem, 1rem + 0.4vw, 1.3125rem)", { lineHeight: "1.55" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        button: ["1rem", { lineHeight: "1", letterSpacing: "-0.005em", fontWeight: "600" }],
        hud: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.14em", fontWeight: "500" }],
        "hud-xs": ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.16em", fontWeight: "500" }],
        wordmark: ["clamp(6rem, 22vw, 22rem)", { lineHeight: "0.8", letterSpacing: "-0.05em", fontWeight: "800" }],
      },
      // rule: hairline rhythm (divider <-> text), 16 px below 768 and 20 px from 768 (--rule-gap, src/index.css).
      spacing: { section: "clamp(6rem, 4rem + 6vw, 10rem)", rule: "var(--rule-gap)", 13: "3.25rem", 18: "4.5rem", 22: "5.5rem" },
      maxWidth: { container: "1280px", wide: "1440px", prose: "64ch", measure: "56ch" },
      borderRadius: { xs: "4px", sm: "8px", md: "12px", lg: "20px", xl: "28px", pill: "9999px" },
      boxShadow: {
        "glow-cta": "inset 0 0 0 1px rgba(255,208,138,0.6), 0 8px 32px -8px rgba(244,184,96,0.55), 0 0 80px -20px rgba(244,184,96,0.45)",
        "glow-cta-h": "inset 0 0 0 1px rgba(255,208,138,0.8), 0 10px 40px -8px rgba(244,184,96,0.7), 0 0 110px -16px rgba(244,184,96,0.55)",
        "glow-rim": "0 -1px 0 0 rgba(255,208,138,0.85), 0 -10px 40px -8px rgba(244,184,96,0.35), 0 -60px 160px -40px rgba(116,212,255,0.22), inset 0 24px 60px -30px rgba(116,212,255,0.25)",
        "glow-sat": "0 0 0 2px rgba(255,208,138,0.25), 0 0 12px 2px rgba(244,184,96,0.8)",
        "glow-ion": "0 0 32px -6px rgba(116,212,255,0.35)",
        "hi-top": "inset 0 1px 0 rgba(255,255,255,0.06)",
        float: "0 24px 60px -24px rgba(0,0,0,0.8)",
        // Legacy (2024) site only.
        card: "0px 35px 120px -15px #211e35",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        inout: "cubic-bezier(0.76, 0, 0.24, 1)",
        ui: "cubic-bezier(0.25, 1, 0.5, 1)",
        in: "cubic-bezier(0.7, 0, 0.84, 0)",
        draw: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      // Tempo pass 2: keep in sync with DUR (src/lib/motion.js) and the --t-* tokens (src/index.css).
      transitionDuration: { press: "100ms", micro: "140ms", ui: "180ms", panel: "320ms", reveal: "500ms" },
      zIndex: { bg: "0", grain: "1", content: "10", rail: "40", nav: "50", sticky: "60", menu: "70", cursor: "80", skip: "90" },
      keyframes: {
        rise: { "0%": { transform: "translateY(105%)" }, "100%": { transform: "translateY(0)" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "ping-signal": { "0%": { transform: "scale(1)", opacity: "0.6" }, "100%": { transform: "scale(2.4)", opacity: "0" } },
        "spin-angle": { to: { "--angle": "360deg" } },
        "draw-x": { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
        twinkle: { "0%, 100%": { opacity: "0.85" }, "50%": { opacity: "1" } },
      },
      animation: {
        rise: "rise 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "rise-fast": "rise 450ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-up": "fade-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "ping-signal": "ping-signal 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "comet-border": "spin-angle 8s linear infinite",
        corona: "spin-angle 60s linear infinite",
        "spin-40": "spin 40s linear infinite",
        "spin-64-rev": "spin 64s linear infinite reverse",
        "draw-x": "draw-x 600ms cubic-bezier(0.65, 0, 0.35, 1) both",
        twinkle: "twinkle 6s ease-in-out infinite",
      },
      backgroundImage: {
        "g-hairline": "linear-gradient(160deg, rgba(237,238,243,0.16), rgba(237,238,243,0.02) 60%)",
        "g-horizon": "radial-gradient(closest-side, #0A0C14 92%, #161A27 99%, #2A2F3F 100%)",
        "g-corona": "conic-gradient(from var(--angle), transparent 0 68%, rgba(255,208,138,0.9) 78%, rgba(116,212,255,0.55) 86%, transparent 94%)",
        "g-wordmark": "linear-gradient(180deg, rgba(237,238,243,0.16), rgba(237,238,243,0) 85%)",
        "g-gold-tint": "linear-gradient(rgba(244,184,96,0.16), rgba(244,184,96,0.16))",
        // Legacy (2024) token, kept for parity with main. The 2024 markup never used it and the image does not exist,
        // so no CSS is generated unless a `bg-hero-pattern` class appears.
        "hero-pattern": "url('/src/assets/herobg.png')",
      },
    },
  },
  plugins: [
    plugin(({ addVariant, matchUtilities, addUtilities }) => {
      addVariant("motion-ok", 'html:not([data-motion="reduced"]) &');
      addVariant("motion-off", 'html[data-motion="reduced"] &');
      addVariant("fine", "@media (hover: hover) and (pointer: fine)");
      addVariant("coarse", "@media (pointer: coarse)");
      addVariant("tier-a", 'html[data-tier="A"] &');
      addVariant("first-visit", 'html[data-visit="first"] &');
      matchUtilities(
        { stretch: (value) => ({ fontStretch: value }) },
        { values: { 100: "100%", 105: "105%", 110: "110%", 112: "112%", 115: "115%", 118: "118%", 125: "125%" } }
      );
      addUtilities({
        ".tabular": { fontVariantNumeric: "tabular-nums" },
        ".mask-fade-b": {
          WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 26%)",
          maskImage: "linear-gradient(to top, transparent 0%, #000 26%)",
        },
      });
    }),
  ],
};
