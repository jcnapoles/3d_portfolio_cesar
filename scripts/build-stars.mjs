// One-off: generate the three static starfield SVG tiles (first-paint starfield + WebGL fallback).
// Run from the repo root: node scripts/build-stars.mjs
import { writeFileSync, mkdirSync } from "node:fs";
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const tiles = [
  { name: "stars-a", size: 240, count: 22, r: 0.5, fill: "#EDEEF3", opacity: 0.3, seed: 7 },
  { name: "stars-b", size: 380, count: 12, r: 0.75, fill: "#EDEEF3", opacity: 0.55, seed: 21 },
  { name: "stars-c", size: 560, count: 6, r: 1, fill: "#FFD08A", opacity: 0.8, seed: 42 },
];
mkdirSync("public/img", { recursive: true });
for (const t of tiles) {
  const r = rng(t.seed); let dots = "";
  for (let i = 0; i < t.count; i++) {
    dots += `<circle cx="${(r() * t.size).toFixed(1)}" cy="${(r() * t.size).toFixed(1)}" r="${t.r}" fill="${t.fill}" fill-opacity="${(t.opacity * (0.5 + r() * 0.5)).toFixed(2)}"/>`;
  }
  writeFileSync(`public/img/${t.name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${t.size}" height="${t.size}" viewBox="0 0 ${t.size} ${t.size}">${dots}</svg>`);
  console.log(`build-stars: public/img/${t.name}.svg`);
}
