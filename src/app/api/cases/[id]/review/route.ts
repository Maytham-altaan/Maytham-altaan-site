import { NextRequest, NextResponse } from "next/server";
import {
  currentUserIsReviewer,
  getSupabaseServer,
  getSupabaseAdmin,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReviewAction = "approve" | "reject" | "unpublish" | "delete";
const VALID_ACTIONS: ReviewAction[] = ["approve", "reject", "unpublish", "delete"];

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const isReviewer = await currentUserIsReviewer();
  if (!isReviewer) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  let body: { action?: ReviewAction; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (!body.action || !VALID_ACTIONS.includes(body.action)) {
    return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
  }

  // Permanent delete: remove the case row (cascades likes + comments) and any
  // stored files. Uses the service role (RLS has no DELETE policy on cases).
  if (body.action === "delete") {
    const admin = getSupabaseAdmin();
    const { data: row } = await admin
      .from("cases")
      .select("image_path, consent_path")
      .eq("id", id)
      .single();
    if (row?.image_path) {
      await admin.storage.from("case-images").remove([row.image_path]);
    }
    if (row?.consent_path) {
      await admin.storage.from("consents").remove([row.consent_path]);
    }
    const { error: delErr } = await admin.from("cases").delete().eq("id", id);
    if (delErr) {
      return NextResponse.json(
        { ok: false, error: "delete_failed", detail: delErr.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  const supa = await getSupabaseServer();
  const { data: userResp } = await supa.auth.getUser();
  const reviewerId = userResp.user?.id ?? null;

  // For approval, compute display_author from show_author flag.
  let displayAuthor: string | null = null;
  if (body.action === "approve") {
    const { data: caseRow } = await supa
      .from("cases")
      .select("show_author, submitter_name, submitter_affiliation")
      .eq("id", id)
      .single();
    if (caseRow) {
      displayAuthor = caseRow.show_author
        ? [caseRow.submitter_name, caseRow.submitter_affiliation]
            .filter(Boolean)
            .join(" · ")
        : "Submitted anonymously";
    }
  }

  // approve -> approved; reject -> rejected; unpublish -> back to pending
  // (so it leaves the public library but can be re-published from the queue).
  const newStatus =
    body.action === "approve"
      ? "approved"
      : body.action === "unpublish"
      ? "pending"
      : "rejected";

  const { error } = await supa
    .from("cases")
    .update({
      status: newStatus,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: body.notes?.slice(0, 1000) ?? null,
      display_author: displayAuthor,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: "update_failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
