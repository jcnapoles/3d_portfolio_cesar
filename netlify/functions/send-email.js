import { Resend } from "resend";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  const requiredEnv = ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "RESEND_TO_EMAIL"];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: `Missing environment variables: ${missing.join(", ")}`,
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid JSON body" }),
    };
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Missing required fields" }),
    };
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
      return {
        statusCode: 502,
        body: JSON.stringify({
          success: false,
          error: error.message || "Resend failed",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error?.message || "Unexpected error while sending email",
      }),
    };
  }
};
