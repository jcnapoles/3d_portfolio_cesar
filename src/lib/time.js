let tarragonaFormatter;

/** Real Tarragona (Europe/Madrid) wall-clock time, for example "14:32 CEST". */
export function formatTarragona(date = new Date()) {
  if (!tarragonaFormatter) {
    tarragonaFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }
  const parts = tarragonaFormatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  let zone = get("timeZoneName");
  // Some engines print "GMT+2" / "GMT+1" for Europe/Madrid in en-GB; normalise to CEST / CET.
  if (/^(GMT|UTC)\+2$/.test(zone)) zone = "CEST";
  else if (/^(GMT|UTC)\+1$/.test(zone)) zone = "CET";
  return `${get("hour")}:${get("minute")} ${zone}`.trim();
}

const pad = (n) => String(n).padStart(2, "0");

/** Elapsed milliseconds as HH:MM:SS. */
export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor((ms || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
