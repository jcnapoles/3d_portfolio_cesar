import { connectLambda, getStore } from "@netlify/blobs";
import { Resend } from "resend";

import {
  TURNSTILE_TOKEN_FIELD,
  checkRateLimit,
  getAllowedOrigins,
  getClientIp,
  isHoneypotTripped,
  isOriginAllowed,
  verifyTurnstileToken,
} from "../shared/anti-spam.js";

const RATE_LIMIT_STORE = "contact-form-rate-limit";

const json = (statusCode, payload, headers = {}) => ({
  statusCode,
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Method not allowed" });
  }

  // Defence 1: only accept submissions that came from one of our own pages.
  // Stops bots that POST straight at the endpoint without ever loading the site.
  if (!isOriginAllowed(event.headers, getAllowedOrigins(process.env))) {
    return json(403, {
      success: false,
      code: "forbidden_origin",
      error: "Forbidden origin",
    });
  }

  // TURNSTILE_SECRET_KEY is required on purpose: without it we would keep
  // accepting mail while silently running with one fewer defence.
  const requiredEnv = [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "RESEND_TO_EMAIL",
    "TURNSTILE_SECRET_KEY",
  ];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return json(500, {
      success: false,
      error: `Missing environment variables: ${missing.join(", ")}`,
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { success: false, error: "Invalid JSON body" });
  }

  // Defence 2: honeypot. Report success so the bot records the submission as
  // delivered and moves on, instead of retrying with a different payload.
  if (isHoneypotTripped(body)) {
    console.warn("Contact form: honeypot tripped, discarding submission");
    return json(200, { success: true });
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return json(400, { success: false, error: "Missing required fields" });
  }

  const ip = getClientIp(event.headers);

  // Defence 3: per-IP rate limit, to cap how much of the Resend quota any single
  // source can burn. Runs before Turnstile so a flood cannot hammer Cloudflare
  // either. Fails open: a Blobs outage must not take the form down.
  if (ip) {
    try {
      // Required before getStore() in a v1 (Lambda signature) function: it wires
      // up the Blobs credentials that Netlify ships on the event.
      connectLambda(event);

      const { allowed, retryAfterSeconds } = await checkRateLimit(
        getStore(RATE_LIMIT_STORE),
        ip
      );

      if (!allowed) {
        return json(
          429,
          { success: false, error: "Too many requests" },
          { "Retry-After": String(retryAfterSeconds) }
        );
      }
    } catch (error) {
      console.warn(
        "Contact form: rate limit unavailable, allowing request:",
        error?.message
      );
    }
  }

  // Defence 4: Cloudflare Turnstile. Catches the bots that do run JavaScript and
  // would otherwise sail through every check above.
  const verification = await verifyTurnstileToken(
    process.env.TURNSTILE_SECRET_KEY,
    body[TURNSTILE_TOKEN_FIELD],
    ip
  );

  if (!verification.success) {
    console.warn(
      "Contact form: Turnstile rejected submission:",
      verification.errorCodes.join(", ")
    );

    return json(403, {
      success: false,
      code: "failed_verification",
      error: "Failed verification",
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESEND_TO_EMAIL,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      return json(502, {
        success: false,
        error: error.message || "Resend failed",
      });
    }

    return json(200, { success: true });
  } catch (error) {
    return json(500, {
      success: false,
      error: error?.message || "Unexpected error while sending email",
    });
  }
};
