// One-off: fresh screenshots of every BUILDS project over the Chrome DevTools Protocol.
// No dependencies beyond sharp (Node 22+ has a global WebSocket). Outputs are committed; never runs on Netlify.
//
// Run from the repo root:
//   node scripts/capture-projects.mjs [--profile <dir>] [--port 9361] [--only closevibe,quinque] [--chrome <exe>]
//   node scripts/optimize-images.mjs projects
//
// For each project: 1440 x 900 viewport at deviceScaleFactor 2, wait for network idle + 2.5 s, scroll a
// bit and back (lazy content), hide cookie banners / chat widgets with injected CSS (nothing is ever
// clicked or accepted), capture, crop 16:10 from the top and write src/assets/projects/<key>.png
// (the master scripts/optimize-images.mjs reads). The script starts its own headless Chrome and
// always closes it, even on failure. A project whose page does not answer 200 keeps its old master.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { BUILDS } from "../src/constants/builds.js";

/* ---------- options ---------- */
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const PORT = Number(opt("port", 9361));
const CHROME = opt("chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");
const PROFILE = opt("profile", join(tmpdir(), "cn-capture-profile"));
const ONLY = opt("only", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const VIEW_W = 1440;
const VIEW_H = 900;
const DPR = 2;
const SETTLE_MS = 2500;
const OUT_DIR = "src/assets/projects";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

/**
 * Per-project capture tweaks: `url` when the screenshot needs a different route than `href`, extra `css`,
 * and `storage` (localStorage seeded before the page's own scripts run, e.g. the UI language the site's
 * own switcher would store). Never consent keys: banners are hidden, not accepted.
 */
const CAPTURE = {
  closevibe: { css: "#closevibe-widget-host { display: none !important; }" }, // the site's own chat launcher
  quinque: { storage: { "quinque:locale": "en" } }, // Spanish by default; English matches this portfolio
};

/* ---------- overlays hidden for the capture only ---------- */
const HIDE_CSS = `
#onetrust-consent-sdk, #onetrust-banner-sdk, #CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay,
#cookiescript_injected, #usercentrics-root, #didomi-host, #axeptio_overlay, #cmpbox, #cmpbox2, .cmp-root,
.cc-window, .cc-banner, .cc-revoke, #cc-main, .cky-consent-container, .cky-overlay, .cookie-banner,
.cookie-consent, .cookies-banner, .cookie-notice, #cookie-banner, #cookie-consent, #cookie-notice,
[class*="CookieConsent"], [class*="cookieConsent"], [class*="cookie-banner" i], [class*="cookie_banner" i],
[id*="cookie-banner" i], [id*="cookie_banner" i], [aria-label*="cookie" i][role="dialog"],
[aria-label*="cookie" i][role="region"], [aria-labelledby*="cookie" i][role="dialog"],
#crisp-chatbox, .crisp-client, #intercom-container, .intercom-lightweight-app, #intercom-frame,
#hubspot-messages-iframe-container, #tidio-chat, #tidio-chat-iframe, [id^="tawk"], .tawk-min-container,
#chatwoot_live_chat_widget, .woot-widget-holder, .woot--bubble-holder, #launcher, #webWidget,
#drift-widget, #drift-frame-controller, #drift-frame-chat, .zsiq_floatmain, #zsiq_float, #fc_frame,
#gorgias-chat-container, [data-capture-hide] { display: none !important; visibility: hidden !important; }
html { scrollbar-width: none !important; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
`;

/**
 * Marks fixed / sticky overlays that are clearly consent banners or chat launchers (by text or by being a
 * small floating box pinned to a bottom corner) so HIDE_CSS removes them. Headers pinned to the top are kept.
 * Runs in the page; returns short descriptions of what it hid (for the log).
 */
const MARK_OVERLAYS = `(() => {
  const vw = innerWidth, vh = innerHeight;
  const hidden = [];
  const CONSENT = /(cookie|cookies|consent|gdpr|galetes|privacidad y cookies|aceptar todas|accept all|rechazar|reject all)/i;
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") continue;
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const text = (el.innerText || "").slice(0, 600);
    const isConsent = CONSENT.test(text) && r.top > vh * 0.25;
    const isLauncher = cs.position === "fixed" && (el.tagName === "IFRAME" || r.width <= 420) && r.height <= 640 &&
      r.bottom > vh - 160 && r.bottom <= vh + 4 && (r.right > vw - 160 || r.left < 160) && r.top > vh * 0.3;
    if (isConsent || isLauncher) {
      el.setAttribute("data-capture-hide", "");
      hidden.push((el.tagName + "#" + (el.id || "") + "." + (typeof el.className === "string" ? el.className : "")).slice(0, 80) + (isConsent ? " [consent]" : " [launcher]"));
    }
  }
  return hidden;
})()`;

/* ---------- tiny CDP client ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Set();
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : ev.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, method } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
        else resolve(msg.result);
      } else {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }
  open() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }));
  }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  waitFor(method, sessionId, timeout = 45000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error(`timeout waiting for ${method}`));
      }, timeout);
      const off = this.on((msg) => {
        if (msg.method === method && msg.sessionId === sessionId) {
          clearTimeout(timer);
          off();
          resolve(msg.params);
        }
      });
    });
  }
  close() {
    try {
      this.ws.close();
    } catch {
      /* already closed */
    }
  }
}

/* ---------- browser ---------- */
async function launch() {
  mkdirSync(PROFILE, { recursive: true });
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--hide-scrollbars",
      "--mute-audio",
      "--lang=en-US",
      `--window-size=${VIEW_W},${VIEW_H}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return { proc, ws: (await res.json()).webSocketDebuggerUrl };
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  proc.kill();
  throw new Error(`Chrome did not open the DevTools port ${PORT}`);
}

function killTree(proc) {
  if (!proc || proc.exitCode !== null) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
  else proc.kill("SIGKILL");
}

/* ---------- one page ---------- */
async function waitNetworkIdle(cdp, sessionId, inflight, { quietMs = 600, maxMs = 30000 } = {}) {
  const start = Date.now();
  let quietSince = inflight.size <= 0 ? Date.now() : 0;
  while (Date.now() - start < maxMs) {
    // "idle" = no request for quietMs, or at most 2 long-lived ones (analytics, streams) for 3x as long.
    const n = inflight.size;
    if (n <= 2) {
      if (!quietSince) quietSince = Date.now();
      const need = n === 0 ? quietMs : quietMs * 3;
      if (Date.now() - quietSince >= need) return true;
    } else {
      quietSince = 0;
    }
    await sleep(100);
  }
  return false;
}

async function capture(cdp, build) {
  const tweak = CAPTURE[build.key] || {};
  const url = tweak.url || build.href;
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);

  const inflight = new Set();
  let docStatus = 0;
  let docUrl = url;
  const off = cdp.on((msg) => {
    if (msg.sessionId !== sessionId) return;
    const p = msg.params || {};
    if (msg.method === "Network.requestWillBeSent") {
      if (!/^(data|blob):/.test(p.request?.url || "")) inflight.add(p.requestId);
    } else if (msg.method === "Network.loadingFinished" || msg.method === "Network.loadingFailed") {
      inflight.delete(p.requestId);
    } else if (msg.method === "Network.responseReceived" && p.type === "Document" && p.frameId === targetId) {
      docStatus = p.response.status;
      docUrl = p.response.url;
    }
  });

  try {
    await send("Page.enable");
    await send("Network.enable");
    await send("Runtime.enable");
    await send("Network.setUserAgentOverride", { userAgent: UA, acceptLanguage: "en-US,en;q=0.9", platform: "Win32" });
    await send("Emulation.setDeviceMetricsOverride", { width: VIEW_W, height: VIEW_H, deviceScaleFactor: DPR, mobile: false });
    await send("Emulation.setLocaleOverride", { locale: "en-US" }).catch(() => {});
    if (tweak.storage) {
      const origin = new URL(url).origin;
      const sets = Object.entries(tweak.storage)
        .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)});`)
        .join(" ");
      await send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try { if (location.origin === ${JSON.stringify(origin)}) { ${sets} } } catch (e) {}`,
      });
    }

    const loaded = cdp.waitFor("Page.loadEventFired", sessionId, 60000);
    await send("Page.navigate", { url });
    await loaded;
    await waitNetworkIdle(cdp, sessionId, inflight);

    if (docStatus !== 200) throw new Error(`document answered ${docStatus || "nothing"} (${docUrl})`);

    const evaluate = async (expression) =>
      (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value;

    await evaluate(`(() => { const s = document.createElement("style"); s.id = "capture-hide"; s.textContent = ${JSON.stringify(
      HIDE_CSS + (tweak.css || "")
    )}; document.head.appendChild(s); })()`);

    // Scroll a bit and back so lazy images / on-view reveals near the fold are triggered.
    await evaluate(`window.scrollTo({ top: Math.min(1600, document.documentElement.scrollHeight), behavior: "instant" })`);
    await sleep(900);
    await evaluate(`window.scrollTo({ top: 600, behavior: "instant" })`);
    await sleep(400);
    await evaluate(`window.scrollTo({ top: 0, behavior: "instant" })`);
    await waitNetworkIdle(cdp, sessionId, inflight, { maxMs: 15000 });
    await evaluate(`document.fonts ? document.fonts.ready.then(() => true) : true`);
    await sleep(SETTLE_MS);

    const hidden = await evaluate(MARK_OVERLAYS);
    const meta = await evaluate(`({ title: document.title, lang: document.documentElement.lang, href: location.href, scrollY })`);
    if (meta.scrollY !== 0) await evaluate(`window.scrollTo({ top: 0, behavior: "instant" })`);
    await sleep(400); // let the hidden overlays / scroll reset paint

    const { data } = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    const shot = sharp(Buffer.from(data, "base64"));
    const { width, height } = await shot.metadata();
    const cropH = Math.min(height, Math.round((width * 10) / 16));
    const out = `${OUT_DIR}/${build.key}.png`;
    const info = await shot
      .extract({ left: 0, top: 0, width, height: cropH })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(out);
    return { out, info, meta, hidden };
  } finally {
    off();
    await cdp.send("Target.closeTarget", { targetId }).catch(() => {});
  }
}

/* ---------- main ---------- */
const targets = BUILDS.filter((b) => !ONLY.length || ONLY.includes(b.key));
if (!targets.length) {
  console.error(`No BUILDS project matches --only ${ONLY.join(",")}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const { proc, ws } = await launch();
const cdp = new CDP(ws);
let failures = 0;
try {
  await cdp.open();
  for (const build of targets) {
    process.stdout.write(`${build.key} <- ${CAPTURE[build.key]?.url || build.href}\n`);
    try {
      const { out, info, meta, hidden } = await capture(cdp, build);
      console.log(`  ${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
      console.log(`  title="${meta.title}" lang=${meta.lang || "-"} at ${meta.href}`);
      if (hidden.length) console.log(`  hid: ${hidden.join(" | ")}`);
    } catch (err) {
      failures += 1;
      console.error(`  FAILED (kept the previous master): ${err.message}`);
    }
  }
} finally {
  await cdp.send("Browser.close").catch(() => {});
  cdp.close();
  await sleep(800);
  killTree(proc);
}
if (failures) process.exitCode = 1;
