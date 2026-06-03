import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const supa = await getSupabaseServer();
  const { data: userResp } = await supa.auth.getUser();
  if (!userResp.user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const { id: caseId } = await ctx.params;
  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const text = (body.body ?? "").toString().trim();
  if (!text) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  if (text.length > 4000)
    return NextResponse.json({ ok: false, error: "too_long" }, { status: 400 });

  const authorName =
    (userResp.user.user_metadata?.full_name as string | undefined) ||
    userResp.user.email ||
    "Anonymous";

  const { data, error } = await supa
    .from("comments")
    .insert({
      case_id: caseId,
      author_id: userResp.user.id,
      author_name: authorName.slice(0, 80),
      body: text,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: "insert_failed", detail: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}
