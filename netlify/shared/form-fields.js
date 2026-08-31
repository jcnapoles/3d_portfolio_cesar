/**
 * Field names shared by the browser form and the server handlers.
 *
 * Kept free of Node built-ins on purpose: this module is imported by the client
 * bundle, so anything like node:crypto in here would break the build.
 *
 * If a name here ever drifts from what the form renders, the matching defence
 * stops working silently, which is exactly the kind of bug nobody notices.
 */

/**
 * Hidden field rendered off-screen and outside the tab order. Humans never see
 * it, so a filled value means a bot populated every input it could find.
 *
 * Deliberately not a browser autofill token (url / website / organization /
 * tel / address), so password managers leave it alone.
 */
export const HONEYPOT_FIELD = "subject_line";

/** Carries the Cloudflare Turnstile token produced by the widget. */
export const TURNSTILE_TOKEN_FIELD = "turnstileToken";
