import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const requiredEnv = ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "RESEND_TO_EMAIL"];

function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return `Missing environment variables: ${missing.join(", ")}`;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const envError = validateEnv();
  if (envError) {
    return res.status(500).json({ success: false, error: envError });
  }

  const { name, email, message } = req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESEND_TO_EMAIL,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      return res.status(502).json({ success: false, error: error.message || "Resend failed" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Unexpected error while sending email",
    });
  }
}
