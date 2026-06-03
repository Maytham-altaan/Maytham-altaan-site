import { NextRequest, NextResponse } from "next/server";
import {
  currentUserIsReviewer,
  getSupabaseServer,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const isReviewer = await currentUserIsReviewer();
  if (!isReviewer) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  let body: { action?: "approve" | "reject"; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
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

  const { error } = await supa
    .from("cases")
    .update({
      status: body.action === "approve" ? "approved" : "rejected",
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
