import { NextRequest, NextResponse } from "next/server";
import {
  currentUserIsReviewer,
  getSupabaseAdmin,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Reviewer-only: streams a consent PDF from the private 'consents' bucket
 *  by generating a short-lived signed URL and redirecting to it. */
export async function GET(req: NextRequest) {
  const isReviewer = await currentUserIsReviewer();
  if (!isReviewer) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ ok: false, error: "missing_path" }, { status: 400 });
  }

  const supa = getSupabaseAdmin();
  const { data, error } = await supa.storage
    .from("consents")
    .createSignedUrl(path, 120); // 2-minute link
  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: "sign_failed", detail: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.redirect(data.signedUrl);
}
