/**
 * Email Maytham when a new case is submitted to the review queue, so he sees it
 * in Gmail without checking the admin dashboard. Best-effort: never throws, and
 * never blocks/fails the submission itself. Reuses the Resend setup already used
 * by the contact form (RESEND_API_KEY, verified maytham-altaan.com sender).
 */

const TO = "Maytham.m.aljubori@gmail.com";
const FROM = "Clinical Case Library <contact@maytham-altaan.com>";
const ADMIN_URL = "https://maytham-altaan.com/en/cases/admin";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type NewSubmission = {
  title_en: string;
  specialty: string;
  case_type: string;
  submitter_name: string;
  submitter_email: string;
  submitter_affiliation?: string | null;
  summary_en: string;
};

export async function notifyNewCaseSubmission(s: NewSubmission): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // email not configured — skip silently

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; font-size:14px; color:#1a1a1a; line-height:1.6;">
      <h2 style="color:#0f766e; margin:0 0 12px;">🆕 New case submitted for review</h2>
      <p style="margin:4px 0;"><strong>Title:</strong> ${esc(s.title_en)}</p>
      <p style="margin:4px 0;"><strong>Specialty / Type:</strong> ${esc(s.specialty)} · ${esc(s.case_type)}</p>
      <p style="margin:4px 0;"><strong>Submitted by:</strong> ${esc(s.submitter_name)} (${esc(s.submitter_email)})${
        s.submitter_affiliation ? ` — ${esc(s.submitter_affiliation)}` : ""
      }</p>
      <p style="margin:12px 0 4px;"><strong>Summary:</strong></p>
      <p style="white-space:pre-wrap; border-left:3px solid #0f766e; padding-left:12px; color:#333; margin:0;">${esc(
        s.summary_en
      )}</p>
      <p style="margin:20px 0 0;">
        <a href="${ADMIN_URL}" style="display:inline-block; background:#0f766e; color:#fff; text-decoration:none; padding:10px 18px; border-radius:999px; font-weight:600;">Review in the dashboard →</a>
      </p>
      <hr style="border:none; border-top:1px solid #eee; margin:16px 0;">
      <p style="font-size:12px; color:#888; margin:0;">Clinical Case Library · maytham-altaan.com. Reply to this email to contact the submitter directly.</p>
    </div>`;

  const text = `New case submitted for review

Title: ${s.title_en}
Specialty / Type: ${s.specialty} · ${s.case_type}
Submitted by: ${s.submitter_name} (${s.submitter_email})${
    s.submitter_affiliation ? ` — ${s.submitter_affiliation}` : ""
  }

Summary:
${s.summary_en}

Review it: ${ADMIN_URL}`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: s.submitter_email,
        subject: `[Case Library] New submission: ${s.title_en}`,
        html,
        text,
      }),
    });
  } catch {
    // best-effort — a failed notification must never break the submission
  }
}
