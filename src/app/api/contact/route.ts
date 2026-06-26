import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Where contact-form messages are delivered.
const TO = "Maytham.m.aljubori@gmail.com";
// Must be an address on a domain verified in Resend (maytham-altaan.com is).
const FROM = "Maytham Altaan Website <contact@maytham-altaan.com>";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "email_not_configured" },
      { status: 503 }
    );
  }

  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const subject = (body.subject || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "bad_email" }, { status: 400 });
  }
  if (name.length > 200 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: "too_long" }, { status: 400 });
  }

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
      <h2 style="color:#0f766e; margin:0 0 12px;">New message from your website</h2>
      <p style="margin:4px 0;"><strong>Name:</strong> ${esc(name)}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${esc(email)}</p>
      ${subject ? `<p style="margin:4px 0;"><strong>Subject:</strong> ${esc(subject)}</p>` : ""}
      <p style="margin:12px 0 4px;"><strong>Message:</strong></p>
      <p style="white-space:pre-wrap; border-left:3px solid #0f766e; padding-left:12px; color:#333; margin:0;">${esc(message)}</p>
      <hr style="border:none; border-top:1px solid #eee; margin:16px 0;">
      <p style="font-size:12px; color:#888; margin:0;">Sent from the contact form at maytham-altaan.com. Reply to this email to respond directly to ${esc(name)}.</p>
    </div>`;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: subject
          ? `[Contact] ${subject}`
          : `[Contact] New message from ${name}`,
        html,
        text: `New message from your website\n\nName: ${name}\nEmail: ${email}\n${subject ? `Subject: ${subject}\n` : ""}\nMessage:\n${message}`,
      }),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: "send_failed", detail: detail.slice(0, 300) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
