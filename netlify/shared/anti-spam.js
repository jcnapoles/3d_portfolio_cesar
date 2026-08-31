import { createHash } from "node:crypto";

import { HONEYPOT_FIELD, TURNSTILE_TOKEN_FIELD } from "./form-fields.js";

export { HONEYPOT_FIELD, TURNSTILE_TOKEN_FIELD };

export const RATE_LIMIT = {
  maxSubmissions: 3,
  windowMs: 15 * 60 * 1000,
};

/** Case-insensitive header lookup: header casing varies by runtime. */
const headerValue = (headers, name) => {
  if (!headers) return null;

  const direct = headers[name];
  if (typeof direct === "string") return direct;

  const match = Object.keys(headers).find(
    (key) => key.toLowerCase() === name.toLowerCase()
  );

  return match ? headers[match] : null;
};

/** Reduces a URL to its bare origin, so trailing slashes and paths don't matter. */
const normalizeOrigin = (value) => {
  if (typeof value !== "string" || value.trim() === "") return null;

  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
};

/**
 * A truthy honeypot value means a bot filled the hidden field.
 * Coerced to a string first: bots don't always send strings.
 */
export const isHoneypotTripped = (body) => {
  const value = body?.[HONEYPOT_FIELD];

  if (value === undefined || value === null) return false;

  return String(value).trim() !== "";
};

/**
 * Origins allowed to submit the form. Netlify populates URL / DEPLOY_PRIME_URL /
 * DEPLOY_URL automatically; ALLOWED_ORIGINS is the manual escape hatch for
 * custom domains and their www variants (comma separated).
 */
export const getAllowedOrigins = (env = {}) => {
  const candidates = [
    ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",") : []),
    env.URL,
    env.DEPLOY_PRIME_URL,
    env.DEPLOY_URL,
  ];

  return new Set(candidates.map(normalizeOrigin).filter(Boolean));
};

/**
 * Browsers send Origin on every POST, including same-origin ones, so requiring
 * it costs real visitors nothing while blocking bots that curl the endpoint
 * directly. Referer is a fallback for the rare client that omits Origin.
 *
 * Fails open when no allowlist is configured, otherwise local dev (where
 * Netlify's env vars don't exist) could never submit the form.
 */
export const isOriginAllowed = (headers, allowedOrigins) => {
  if (allowedOrigins.size === 0) return true;

  const origin =
    normalizeOrigin(headerValue(headers, "origin")) ??
    normalizeOrigin(headerValue(headers, "referer"));

  if (!origin) return false;

  return allowedOrigins.has(origin);
};

/** Real visitor IP. x-nf-client-connection-ip is the one Netlify guarantees. */
export const getClientIp = (headers) => {
  const direct = headerValue(headers, "x-nf-client-connection-ip");
  if (direct) return direct.trim();

  const forwarded = headerValue(headers, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const clientIp = headerValue(headers, "client-ip");
  return clientIp ? clientIp.trim() : null;
};

/**
 * Fixed-window per-IP counter backed by a Netlify Blobs store.
 *
 * Read-modify-write is not atomic, so a burst of simultaneous requests can slip
 * an extra submission or two past the cap. That is fine here: the goal is to
 * stop sustained abuse of the Resend quota, not to enforce an exact quota.
 */
export const checkRateLimit = async (store, ip, now = Date.now()) => {
  // Hashed so the store never holds raw visitor IPs.
  const key = createHash("sha256").update(ip).digest("hex");
  const record = await store.get(key, { type: "json" });

  const withinWindow =
    record &&
    typeof record.windowStart === "number" &&
    now - record.windowStart < RATE_LIMIT.windowMs;

  const windowStart = withinWindow ? record.windowStart : now;
  const count = withinWindow ? record.count : 0;

  if (count >= RATE_LIMIT.maxSubmissions) {
    const resetsAt = windowStart + RATE_LIMIT.windowMs;

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((resetsAt - now) / 1000)),
    };
  }

  await store.setJSON(key, { count: count + 1, windowStart });

  return { allowed: true };
};

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Cloudflare rejects longer tokens outright, so don't spend a round trip on them. */
const TURNSTILE_MAX_TOKEN_LENGTH = 2048;

const TURNSTILE_TIMEOUT_MS = 8000;

/**
 * Validates a Turnstile token against Cloudflare's siteverify API.
 *
 * Tokens are single use and expire 300 seconds after they are issued, so a
 * replayed one comes back as `timeout-or-duplicate`. Passing the visitor IP
 * sharpens Cloudflare's own scoring.
 *
 * Unlike the rate limit this fails CLOSED: a submission we could not verify is
 * not a submission we should deliver.
 */
export const verifyTurnstileToken = async (secret, token, remoteIp) => {
  if (typeof token !== "string" || token.trim() === "") {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  if (token.length > TURNSTILE_MAX_TOKEN_LENGTH) {
    return { success: false, errorCodes: ["invalid-input-response"] };
  }

  const payload = new URLSearchParams({ secret, response: token });
  if (remoteIp) payload.set("remoteip", remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { success: false, errorCodes: [`http-${response.status}`] };
    }

    const result = await response.json();

    return {
      success: result.success === true,
      errorCodes: result["error-codes"] ?? [],
    };
  } catch (error) {
    return {
      success: false,
      errorCodes: [error?.name === "TimeoutError" ? "timeout" : "internal-error"],
    };
  }
};
