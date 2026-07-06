import { NextRequest, NextResponse } from "next/server";
import {
  currentUserIsReviewer,
  getSupabaseServer,
  getSupabaseAdmin,
} from "@/lib/supabase/server";
import { renderCasePdf } from "@/lib/cases/casePdf";
import { mintZenodoDoi } from "@/lib/cases/zenodo";
import type { CaseRow } from "@/lib/cases/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type ReviewAction =
  | "approve"
  | "reject"
  | "unpublish"
  | "delete"
  | "set_doi"
  | "mint_doi";
const VALID_ACTIONS: ReviewAction[] = [
  "approve",
  "reject",
  "unpublish",
  "delete",
  "set_doi",
  "mint_doi",
];

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const isReviewer = await currentUserIsReviewer();
  if (!isReviewer) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  let body: { action?: ReviewAction; notes?: string; doi?: string };
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

  // Assign / update a DOI on a published case.
  if (body.action === "set_doi") {
    const { error } = await supa
      .from("cases")
      .update({ doi: (body.doi || "").trim() || null })
      .eq("id", id);
    if (error) {
      return NextResponse.json(
        { ok: false, error: "doi_update_failed", detail: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  // Publish the case's PDF to Zenodo and mint a real, citable DOI.
  if (body.action === "mint_doi") {
    const admin = getSupabaseAdmin();
    const { data: caseRow, error: fetchErr } = await admin
      .from("cases")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !caseRow) {
      return NextResponse.json({ ok: false, error: "case_not_found" }, { status: 404 });
    }
    const c = caseRow as CaseRow;
    if (c.status !== "approved") {
      return NextResponse.json(
        {
          ok: false,
          error: "must_be_published",
          message: "Publish the case first, then mint its DOI.",
        },
        { status: 400 }
      );
    }
    if (c.doi) {
      return NextResponse.json(
        {
          ok: false,
          error: "already_has_doi",
          message: `This case already has a DOI (${c.doi}).`,
          doi: c.doi,
        },
        { status: 400 }
      );
    }
    try {
      const pdf = await renderCasePdf(c);
      const { doi, recordUrl } = await mintZenodoDoi(c, pdf);
      const { error: saveErr } = await admin.from("cases").update({ doi }).eq("id", id);
      if (saveErr) {
        return NextResponse.json(
          {
            ok: false,
            error: "doi_save_failed",
            message: `DOI ${doi} was minted but couldn't be saved: ${saveErr.message}`,
            doi,
            recordUrl,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, doi, recordUrl });
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: "zenodo_failed",
          message: e instanceof Error ? e.message : "Zenodo minting failed.",
        },
        { status: 502 }
      );
    }
  }

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
