// One-off: build public/og-image.png (1200x630), public/favicon.svg and public/apple-touch-icon.png.
// Run from the repo root after optimize-images: node scripts/build-og.mjs
// Set OG_FONT=Arial to re-render the text with Arial only if any text is missing in the PNG.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const W = 1200;
const H = 630;
const FONT = process.env.OG_FONT || "Segoe UI, Arial, sans-serif";

/* ---------- favicon.svg ---------- */
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#05060A"/><path fill="#F4B860" d="M32 6 L34.4 29.6 L58 32 L34.4 34.4 L32 58 L29.6 34.4 L6 32 L29.6 29.6 Z"/><path fill="#FFD08A" opacity=".6" d="M24 24 L32 30.2 L40 24 L33.8 32 L40 40 L32 33.8 L24 40 L30.2 32 Z"/><circle cx="32" cy="32" r="3.2" fill="#FFF6E8"/></svg>`;
writeFileSync("public/favicon.svg", FAVICON + "\n");
console.log("build-og: public/favicon.svg");

/* ---------- apple-touch-icon.png (180x180) ---------- */
await sharp(Buffer.from(FAVICON), { density: 72 * (180 / 64) })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile("public/apple-touch-icon.png");
console.log("build-og: public/apple-touch-icon.png");

/* ---------- og-image.png ---------- */
const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="neb" cx="75%" cy="20%" r="60%">
        <stop offset="0" stop-color="#2B3A8C" stop-opacity="0.30"/>
        <stop offset="1" stop-color="#2B3A8C" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#05060A"/>
    <rect width="${W}" height="${H}" fill="url(#neb)"/>
  </svg>`
);

// Horizon: an 1800 px circle whose top edge sits at y = 560, 1 px gold rim.
const R = 900;
const horizon = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="planet" cx="50%" cy="50%" r="50%">
        <stop offset="0.92" stop-color="#0A0C14"/>
        <stop offset="0.99" stop-color="#161A27"/>
        <stop offset="1" stop-color="#2A2F3F"/>
      </radialGradient>
      <linearGradient id="rimGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4B860" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#F4B860" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <circle cx="${W / 2}" cy="${560 + R}" r="${R + 14}" fill="url(#rimGlow)" opacity="0.6"/>
    <circle cx="${W / 2}" cy="${560 + R}" r="${R}" fill="url(#planet)" stroke="#FFD08A" stroke-opacity="0.85" stroke-width="1"/>
  </svg>`
);

// Portrait: the cut-out at 440 px wide (circle fallback when no cut-out master exists), bottom fade.
const PORTRAIT_X = 720;
const PORTRAIT_Y = 100;
const PORTRAIT_W = 440;
const maxH = H - PORTRAIT_Y;
let portrait;
if (existsSync("scripts/source/cesar-cutout.png")) {
  const resized = await sharp("scripts/source/cesar-cutout.png").trim().resize({ width: PORTRAIT_W }).png().toBuffer();
  const meta = await sharp(resized).metadata();
  const h = Math.min(meta.height, maxH);
  const fade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PORTRAIT_W}" height="${h}">
      <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.70" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient></defs>
      <rect width="${PORTRAIT_W}" height="${h}" fill="url(#f)"/>
    </svg>`
  );
  portrait = await sharp(resized)
    .extract({ left: 0, top: 0, width: PORTRAIT_W, height: h })
    .composite([{ input: fade, blend: "dest-in" }])
    .png()
    .toBuffer();
} else {
  const size = 400;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
  portrait = await sharp("public/PerfilProColor.jpeg")
    .resize({ width: size, height: size, fit: "cover", position: "top" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

// Text overlay.
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const CHIPS = ["12+ years", "250K+ users", "CaixaBank Tech"];
const CHIP_Y = 380;
const CHIP_H = 44;
let chipX = 80;
let chips = "";
for (const label of CHIPS) {
  const w = Math.round(label.length * 12.4 + 36);
  chips += `<rect x="${chipX}" y="${CHIP_Y}" width="${w}" height="${CHIP_H}" rx="10" fill="none" stroke="#3A3F4E" stroke-width="1"/>`;
  chips += `<text x="${chipX + w / 2}" y="${CHIP_Y + 29}" text-anchor="middle" font-size="22" fill="#74D4FF">${esc(label)}</text>`;
  chipX += w + 16;
}
const text = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <g font-family="${FONT}">
      <text x="80" y="150" font-size="22" fill="#F4B860" letter-spacing="4">FRACTIONAL CTO</text>
      <text x="80" y="240" font-size="64" font-weight="700" fill="#EDEEF3">Senior tech leadership.</text>
      <text x="80" y="300" font-size="40" fill="#A1A6B4">Without the full-time CTO.</text>
      ${chips}
    </g>
  </svg>`
);

const portraitMeta = await sharp(portrait).metadata();
const portraitLeft = existsSync("scripts/source/cesar-cutout.png") ? PORTRAIT_X : PORTRAIT_X + 20;

await sharp(background)
  .composite([
    { input: readFileSync("public/img/stars-a.svg"), tile: true, top: 0, left: 0 },
    { input: readFileSync("public/img/stars-b.svg"), tile: true, top: 0, left: 0 },
    { input: portrait, left: portraitLeft, top: PORTRAIT_Y },
    { input: horizon, left: 0, top: 0 },
    { input: text, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/og-image.png");
console.log(`build-og: public/og-image.png (portrait ${portraitMeta.width}x${portraitMeta.height})`);
