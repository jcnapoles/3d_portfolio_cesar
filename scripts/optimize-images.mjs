// One-off image pipeline (sharp 0.34.5). Run from the repo root: node scripts/optimize-images.mjs
// Outputs are committed; this never runs on Netlify.
//
// Sections: pass any of portrait | projects | testimonials | about | company to run only those
// (e.g. `node scripts/optimize-images.mjs projects` after scripts/capture-projects.mjs); no argument runs all.
//
// Hero portrait:
//   - cutout mode (default): scripts/source/cesar-cutout.png (rembg master) -> public/img/portrait/cesar-cutout-{440,880}.{avif,webp}
//   - circle fallback (only when the cut-out master is missing): public/PerfilProColor.jpeg -> public/img/portrait/cesar-circle-{440,468}.{avif,webp}
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const kb = (file) => `${(statSync(file).size / 1024).toFixed(1)} KB`;
const ensureDir = (file) => mkdirSync(dirname(file), { recursive: true });

const SECTIONS = ["portrait", "projects", "testimonials", "about", "company"];
const requested = process.argv.slice(2);
const unknown = requested.filter((s) => !SECTIONS.includes(s));
if (unknown.length) {
  console.error(`Unknown section(s): ${unknown.join(", ")}. Use any of: ${SECTIONS.join(", ")}`);
  process.exit(1);
}
const run = (section) => !requested.length || requested.includes(section);

async function write(pipeline, file, format, options) {
  ensureDir(file);
  const info = await pipeline.clone().toFormat(format, options).toFile(file);
  console.log(`  ${file}  ${info.width}x${info.height}  ${kb(file)}`);
  return info;
}

/* ---------- 1. Hero portrait ---------- */
const CUTOUT_MASTER = "scripts/source/cesar-cutout.png";
if (!run("portrait")) {
  // skipped
} else if (existsSync(CUTOUT_MASTER)) {
  console.log("hero portrait (cutout mode)");
  // Trim once so both sizes share the same crop.
  const trimmed = await sharp(CUTOUT_MASTER).trim().png().toBuffer();
  for (const width of [440, 880]) {
    const base = sharp(trimmed)
      .resize({ width })
      .modulate({ brightness: 0.96 })
      .linear(1.05, -4);
    const info = await write(base, `public/img/portrait/cesar-cutout-${width}.avif`, "avif", { quality: 55, effort: 6 });
    await write(base, `public/img/portrait/cesar-cutout-${width}.webp`, "webp", { quality: 78 });
    console.log(`  -> final cesar-cutout-${width}: ${info.width} x ${info.height}`);
  }
} else {
  console.log("hero portrait (circle fallback: no cut-out master found)");
  for (const size of [440, 468]) {
    const base = sharp("public/PerfilProColor.jpeg").resize({ width: size, height: size, fit: "cover", position: "top" });
    const info = await write(base, `public/img/portrait/cesar-circle-${size}.avif`, "avif", { quality: 55, effort: 6 });
    await write(base, `public/img/portrait/cesar-circle-${size}.webp`, "webp", { quality: 78 });
    console.log(`  -> final cesar-circle-${size}: ${info.width} x ${info.height}`);
  }
}

/* ---------- 2. Project screenshots (16:10, top-anchored) ---------- */
// Masters: src/assets/projects/<key>.png, 2880 x 1800 captures written by scripts/capture-projects.mjs.
// Output names (<key>-{640,1280}.{avif,webp}) are what src/assets/media.js reads; keep them stable.
const PROJECTS = ["closevibe", "cashela", "1234ticket", "quinque", "investanalysis", "fullstackquestions", "dretimediacio", "vcdetectius", "fiatbrav"];
if (run("projects")) {
  console.log("project screenshots");
  for (const key of PROJECTS) {
    const input = `src/assets/projects/${key}.png`;
    for (const w of [640, 1280]) {
      const base = sharp(input)
        .resize({ width: w, height: (w * 10) / 16, fit: "cover", position: "top", kernel: "lanczos3" })
        .flatten({ background: "#0A0C14" }); // screenshots are opaque; drop the alpha band
      await write(base, `src/assets/generated/projects/${key}-${w}.avif`, "avif", { quality: 50, effort: 6 });
      await write(base, `src/assets/generated/projects/${key}-${w}.webp`, "webp", { quality: 72 });
    }
  }
}

/* ---------- 3. Testimonial photos ---------- */
const TESTIMONIALS = [
  ["erasmo", "public/testimonials/erasmo.jpeg"],
  ["jorge", "public/testimonials/jorgeisern.jpg"],
  ["reynier", "public/testimonials/reynier.jpeg"],
  ["lazaro", "public/testimonials/lazaro.jpeg"],
  ["suneidis", "public/testimonials/suneidis.jpeg"],
];
if (run("testimonials")) {
  console.log("testimonial photos");
  for (const [key, input] of TESTIMONIALS) {
    for (const s of [96, 192]) {
      const base = sharp(input).resize({ width: s, height: s, fit: "cover", position: "attention" });
      await write(base, `src/assets/generated/testimonials/${key}-${s}.avif`, "avif", { quality: 55 });
      await write(base, `src/assets/generated/testimonials/${key}-${s}.webp`, "webp", { quality: 75 });
    }
  }
}

/* ---------- 4. About portrait ---------- */
if (run("about")) {
  console.log("about portrait");
  for (const s of [240, 468]) {
    const base = sharp("public/PerfilProColor.jpeg").resize({ width: s, height: s, fit: "cover", position: "top" });
    await write(base, `src/assets/generated/portrait/about-${s}.avif`, "avif", { quality: 55 });
    await write(base, `src/assets/generated/portrait/about-${s}.webp`, "webp", { quality: 78 });
  }
}

/* ---------- 5. Company marks ---------- */
if (run("company")) {
  console.log("company marks");
  await write(
    sharp("src/assets/company/closevibe.png").extract({ left: 300, top: 180, width: 420, height: 420 }).resize({ width: 128 }),
    "src/assets/generated/company/closevibe-mark-128.webp",
    "webp",
    { quality: 80 }
  );
  await write(
    sharp("src/assets/company/uci.png").resize({ width: 128 }),
    "src/assets/generated/company/uci-128.webp",
    "webp",
    { quality: 80 }
  );
}
