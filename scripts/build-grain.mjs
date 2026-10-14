// One-off: generate the static 128x128 grain tile (white pixels, seeded random alpha).
// Run from the repo root: node scripts/build-grain.mjs
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SIZE = 128;
const buf = Buffer.alloc(SIZE * SIZE * 4);

// Classic LCG (Numerical Recipes constants), seed 1337.
let state = 1337 >>> 0;
const next = () => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state;
};

for (let i = 0; i < SIZE * SIZE; i++) {
  const o = i * 4;
  buf[o] = 255;
  buf[o + 1] = 255;
  buf[o + 2] = 255;
  buf[o + 3] = next() >>> 24; // 0-255
}

mkdirSync("public/img", { recursive: true });
await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile("public/img/grain-128.png");
console.log("build-grain: public/img/grain-128.png");
