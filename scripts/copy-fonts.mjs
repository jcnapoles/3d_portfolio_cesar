// One-off: copy the two self-hosted variable fonts from @fontsource-variable into public/fonts.
// Run from the repo root: node scripts/copy-fonts.mjs
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";

const FILES = [
  {
    from: "node_modules/@fontsource-variable/mona-sans/files/mona-sans-latin-standard-normal.woff2",
    to: "public/fonts/mona-sans-latin-standard.woff2",
  },
  {
    from: "node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2",
    to: "public/fonts/geist-mono-latin-wght.woff2",
  },
];

mkdirSync("public/fonts", { recursive: true });

let failed = false;
for (const { from, to } of FILES) {
  if (!existsSync(from)) {
    console.error(`copy-fonts: missing source file ${from}. Run the Phase F npm installs first.`);
    failed = true;
    continue;
  }
  copyFileSync(from, to);
  console.log(`copy-fonts: ${to} (${statSync(to).size} B)`);
}

if (failed) process.exit(1);
