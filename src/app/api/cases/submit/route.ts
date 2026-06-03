import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { slugify, CASE_TYPES, CASE_OUTCOMES } from "@/lib/cases/types";

export const runtime = "nodejs";

const ALLOWED_PDF_MIME = ["application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { ok: false, error: "case_library_not_configured" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_form" }, { status: 400 });
  }

  const get = (k: string) => (form.get(k) ?? "").toString().trim();
  const title_en = get("title_en");
  const summary_en = get("summary_en");
  const specialty = get("specialty");
  const case_type = get("case_type");
  const presentation = get("presentation");
  const submitter_name = get("submitter_name");
  const submitter_email = get("submitter_email");
  const consent = form.get("consent");

  const required = { title_en, summary_en, specialty, case_type, presentation, submitter_name, submitter_email };
  for (const [k, v] of Object.entries(required)) {
    if (!v) return NextResponse.json({ ok: false, error: `missing_${k}` }, { status: 400 });
  }
  if (!CASE_TYPES.includes(case_type as never)) {
    return NextResponse.json({ ok: false, error: "bad_case_type" }, { status: 400 });
  }
  if (!(consent instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_consent" }, { status: 400 });
  }
  if (!ALLOWED_PDF_MIME.includes(consent.type)) {
    return NextResponse.json({ ok: false, error: "consent_not_pdf" }, { status: 400 });
  }
  if (consent.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "consent_too_large" }, { status: 400 });
  }

  const outcome = get("outcome");
  if (outcome && !CASE_OUTCOMES.includes(outcome as never)) {
    return NextResponse.json({ ok: false, error: "bad_outcome" }, { status: 400 });
  }

  const ageStr = get("patient_age");
  const patient_age = ageStr ? Math.max(0, Math.min(120, parseInt(ageStr, 10) || 0)) : null;
  const sex = get("patient_sex");
  const patient_sex = ["M", "F", "other", "unspecified"].includes(sex) ? sex : null;

  const supa = getSupabaseAdmin();

  // 1. Upload consent PDF to private 'consents' bucket
  const baseSlug = slugify(title_en);
  const stamp = Date.now().toString(36);
  const consentPath = `${baseSlug}-${stamp}.pdf`;
  const buf = Buffer.from(await consent.arrayBuffer());
  const { error: upErr } = await supa.storage
    .from("consents")
    .upload(consentPath, buf, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json(
      { ok: false, error: "consent_upload_failed", detail: upErr.message },
      { status: 500 }
    );
  }

  // 2. Ensure unique slug for the case row
  let finalSlug = baseSlug;
  for (let n = 1; n < 50; n++) {
    const { data: existing } = await supa
      .from("cases")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (!existing) break;
    finalSlug = `${baseSlug}-${n}`;
  }

  // 3. Insert pending case
  const { data: inserted, error: insErr } = await supa
    .from("cases")
    .insert({
      slug: finalSlug,
      status: "pending",
      title_en,
      title_ar: get("title_ar") || null,
      summary_en,
      summary_ar: get("summary_ar") || null,
      specialty,
      case_type,
      drug: get("drug") || null,
      outcome: outcome || null,
      patient_age,
      patient_sex,
      presentation,
      investigations: get("investigations") || null,
      diagnosis: get("diagnosis") || null,
      treatment: get("treatment") || null,
      case_outcome: get("case_outcome") || null,
      learning_points: get("learning_points") || null,
      references_text: get("references_text") || null,
      consent_path: consentPath,
      submitter_name,
      submitter_email,
      submitter_affiliation: get("submitter_affiliation") || null,
      show_author: get("show_author") === "true",
    })
    .select("id, slug")
    .single();
  if (insErr) {
    return NextResponse.json(
      { ok: false, error: "insert_failed", detail: insErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: inserted.id, slug: inserted.slug });
}
