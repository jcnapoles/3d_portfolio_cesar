// Media map, hand-written from the outputs of scripts/optimize-images.mjs (Phase F).
// Hashed URLs for files under src/assets come from Vite; the portrait cut-out lives in /public (stable URL, also used by JSON-LD tooling).
//
// Image shape for <Picture>: { avif, webp, src, width, height } where avif/webp are srcset strings.

import caixabanktechLogo from "./company/caixabanktech.png";
import fiatcLogo from "./company/fiatc.svg";
// sttok_logo.svg in git is truncated (327 B, its path data ends in "...") and renders blank; the PNG is the
// same wordmark (894 x 261, transparent).
import sttokLogo from "./company/sttok_logo.png";
import flyrLogo from "./company/flyr.svg";
import indraLogo from "./company/indra.svg";
import isernLogo from "./company/isern.png";
import amarisLogo from "./company/amaris.svg";
// Closevibe: the official mark (closevibe-frontend public/assets/images/logo.png, transparent, with the envelope
// flap and the check knocked out) traced to SVG, plus a horizontal lockup with a Poppins SemiBold wordmark set as
// outlines. Colour on the band, white silhouettes in the hero strip and the flight log (they key off alpha).
import closevibeMarkSvg from "./company/closevibe-mark.svg";
import closevibeLogoSvg from "./company/closevibe-logo.svg";
import uciWebp from "./generated/company/uci-128.webp";
// Cashela: the "C" mark (path 1 of the official wordmark SVG, kept as company/cashela-mark.svg).
// 1234ticket: the ticket (with "1234" knocked out) keyed out of the square app logo (company/1234ticket.png).
// Both carry their shape in the alpha channel: the flight log and the hero strip render logos as white silhouettes.
import cashelaMarkWebp from "./generated/company/cashela-128.webp";
import ticket1234MarkWebp from "./generated/company/1234ticket-128.webp";

const projectFiles = import.meta.glob("./generated/projects/*.{avif,webp}", { eager: true, import: "default" });
const testimonialFiles = import.meta.glob("./generated/testimonials/*.{avif,webp}", { eager: true, import: "default" });
const portraitFiles = import.meta.glob("./generated/portrait/*.{avif,webp}", { eager: true, import: "default" });

function pick(files, dir, name) {
  const url = files[`./generated/${dir}/${name}`];
  if (!url) throw new Error(`media.js: missing generated file ${dir}/${name} (run scripts/optimize-images.mjs)`);
  return url;
}

/** Builds { avif, webp, src, width, height } from <key>-<w>.<ext> files; src = the largest WebP. */
function responsive(files, dir, key, widths, width, height) {
  const set = (ext) => widths.map((w) => `${pick(files, dir, `${key}-${w}.${ext}`)} ${w}w`).join(", ");
  return {
    avif: set("avif"),
    webp: set("webp"),
    src: pick(files, dir, `${key}-${widths[widths.length - 1]}.webp`),
    width,
    height,
  };
}

/**
 * Hero portrait. mode 'cutout': rembg cut-out (transparent background), 880 x 860 intrinsic.
 * Public URLs; no longer preloaded. Used lazily by the contact portrait (LaunchPortrait).
 */
export const heroPortrait = {
  mode: "cutout",
  avif: "/img/portrait/cesar-cutout-440.avif 440w, /img/portrait/cesar-cutout-880.avif 880w",
  webp: "/img/portrait/cesar-cutout-440.webp 440w, /img/portrait/cesar-cutout-880.webp 880w",
  src: "/img/portrait/cesar-cutout-880.webp",
  width: 880,
  height: 860,
};

/** About portrait (square crop of PerfilProColor.jpeg), 240 / 468. */
export const aboutPortrait = responsive(portraitFiles, "portrait", "about", [240, 468], 468, 468);

const PROJECT_KEYS = ["closevibe", "cashela", "1234ticket", "quinque", "investanalysis", "fullstackquestions", "dretimediacio", "vcdetectius", "fiatbrav"];

/** Project screenshots, 16:10 top-anchored crops at 640 / 1280. */
export const projectShots = Object.fromEntries(
  PROJECT_KEYS.map((key) => [key, responsive(projectFiles, "projects", key, [640, 1280], 1280, 800)])
);

const TESTIMONIAL_KEYS = ["erasmo", "jorge", "reynier", "lazaro", "suneidis"];

/** Testimonial avatars, square at 96 / 192. */
export const testimonialPhotos = Object.fromEntries(
  TESTIMONIAL_KEYS.map((key) => [key, responsive(testimonialFiles, "testimonials", key, [96, 192], 192, 192)])
);

/** Company logos. SVG width/height come from each file's viewBox (rounded). */
export const companyLogos = {
  "1234ticket": { src: ticket1234MarkWebp, width: 128, height: 56, alt: "1234ticket" },
  cashela: { src: cashelaMarkWebp, width: 128, height: 104, alt: "Cashela" },
  caixabanktech: { src: caixabanktechLogo, width: 200, height: 50, alt: "CaixaBank Tech" },
  closevibe: { src: closevibeMarkSvg, width: 568, height: 578, alt: "Closevibe" },
  closevibeLogo: { src: closevibeLogoSvg, width: 2575, height: 578, alt: "Closevibe" },
  fiatc: { src: fiatcLogo, width: 215, height: 59, alt: "FIATC" },
  sttok: { src: sttokLogo, width: 894, height: 261, alt: "Sttok" },
  flyr: { src: flyrLogo, width: 140, height: 24, alt: "Flyr" },
  indra: { src: indraLogo, width: 1103, height: 288, alt: "Indra" },
  isern: { src: isernLogo, width: 380, height: 188, alt: "Isern" },
  amaris: { src: amarisLogo, width: 94, height: 35, alt: "Amaris" },
  uci: { src: uciWebp, width: 128, height: 94, alt: "Universidad de las Ciencias Informáticas" },
};

/** The Closevibe mark (official colours: blue-violet bubble, teal envelope). */
export const closevibeMark = companyLogos.closevibe.src;
