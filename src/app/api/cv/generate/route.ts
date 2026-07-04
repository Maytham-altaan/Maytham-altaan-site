import { NextRequest, NextResponse } from "next/server";
import {
  parseDocx,
  generateCvHtml,
  injectPhoto,
  checkRateLimit,
} from "@/lib/cv/generate";
import { htmlToPdf } from "@/lib/cv/pdf";

// mammoth + @react-pdf + Groq call — Node runtime, may take ~10-20s.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

function jsonError(error: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return jsonError(
      "rate_limit",
      "You've reached the hourly limit. Please try again later.",
      429
    );
  }

  // --- read the uploaded file ---
  let file: File | null = null;
  let styleId = "";
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f && typeof f === "object" && "arrayBuffer" in f) file = f as File;
    styleId = (form.get("style") ?? "").toString();
  } catch {
    return jsonError("bad_request", "Could not read the uploaded file.", 400);
  }

  if (!file) {
    return jsonError("no_file", "Please choose a .docx file to upload.", 400);
  }

  // Trust the extension; mammoth validates the actual content below (a
  // mislabelled or non-docx file throws → clean 422). MIME is unreliable —
  // browsers/OSes send .docx as octet-stream, the Office MIME, or "".
  const nameOk = file.name?.toLowerCase().endsWith(".docx");
  if (!nameOk) {
    return jsonError("bad_file", "Please upload a Word .docx file.", 415);
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return jsonError("too_large", "The file is empty or larger than 8 MB.", 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // --- parse ---
  let text = "";
  let photoDataUri: string | null = null;
  try {
    const parsed = await parseDocx(buffer);
    text = parsed.text;
    photoDataUri = parsed.photoDataUri;
  } catch {
    return jsonError("parse_failed", "We couldn't read that Word file.", 422);
  }

  if (text.replace(/\s/g, "").length < 30) {
    return jsonError(
      "no_text",
      "We couldn't find enough text in that document. Make sure your CV text is inside the .docx.",
      422
    );
  }

  // --- AI designs the CV as a full HTML/CSS document ---
  const design = await generateCvHtml(text, {
    hasPhoto: Boolean(photoDataUri),
    styleId,
  });
  if (!design.ok) {
    return jsonError("ai_failed", design.error, 502);
  }
  const html = injectPhoto(design.html, photoDataUri);

  // --- render the design to PDF (headless Chromium) ---
  let pdf: Buffer;
  try {
    pdf = await htmlToPdf(html);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "render error";
    return jsonError("render_failed", `Couldn't render the PDF (${msg.slice(0, 120)}).`, 500);
  }

  const slug =
    (file.name.replace(/\.docx$/i, "") || "professional")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "professional";

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${slug}-cv.pdf"`,
      "cache-control": "no-store",
      "x-rate-remaining": String(rl.remaining),
    },
  });
}
