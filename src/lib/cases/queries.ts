import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  CaseRow,
  CommentRow,
  CaseType,
  CaseOutcome,
} from "./types";

function supabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type ListCasesFilters = {
  specialty?: string;
  caseType?: CaseType;
  outcome?: CaseOutcome;
  drug?: string;
  q?: string;
};

export async function listApprovedCases(
  filters: ListCasesFilters = {}
): Promise<CaseRow[]> {
  if (!supabaseConfigured()) return [];
  const supa = await getSupabaseServer();
  let q = supa
    .from("cases")
    .select("*")
    .eq("status", "approved")
    .order("submitted_at", { ascending: false })
    .limit(60);

  if (filters.specialty) q = q.eq("specialty", filters.specialty);
  if (filters.caseType) q = q.eq("case_type", filters.caseType);
  if (filters.outcome) q = q.eq("outcome", filters.outcome);
  if (filters.drug) q = q.ilike("drug", `%${filters.drug}%`);
  if (filters.q) {
    q = q.or(
      `title_en.ilike.%${filters.q}%,summary_en.ilike.%${filters.q}%,title_ar.ilike.%${filters.q}%,summary_ar.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await q;
  if (error) {
    console.error("listApprovedCases error", error);
    return [];
  }
  return (data ?? []) as CaseRow[];
}

export async function getApprovedCaseBySlug(
  slug: string
): Promise<CaseRow | null> {
  if (!supabaseConfigured()) return null;
  const supa = await getSupabaseServer();
  const { data } = await supa
    .from("cases")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  return (data as CaseRow | null) ?? null;
}

export async function listCommentsForCase(
  caseId: string
): Promise<CommentRow[]> {
  if (!supabaseConfigured()) return [];
  const supa = await getSupabaseServer();
  const { data } = await supa
    .from("comments")
    .select("*")
    .eq("case_id", caseId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });
  return (data as CommentRow[] | null) ?? [];
}

/** Approved case slugs + timestamps for the sitemap. Uses a plain anon
 *  client (no cookies) so it's safe to call from sitemap.ts at build time. */
export async function listApprovedCaseSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (!supabaseConfigured()) return [];
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data } = await supa
    .from("cases")
    .select("slug, updated_at")
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(2000);
  return (data as { slug: string; updated_at: string }[] | null) ?? [];
}

export async function getCaseLikeInfo(
  caseId: string
): Promise<{ count: number; likedByMe: boolean }> {
  if (!supabaseConfigured()) return { count: 0, likedByMe: false };
  const supa = await getSupabaseServer();
  const { count } = await supa
    .from("case_likes")
    .select("*", { count: "exact", head: true })
    .eq("case_id", caseId);

  let likedByMe = false;
  const { data: userResp } = await supa.auth.getUser();
  if (userResp.user) {
    const { data: mine } = await supa
      .from("case_likes")
      .select("case_id")
      .eq("case_id", caseId)
      .eq("user_id", userResp.user.id)
      .maybeSingle();
    likedByMe = !!mine;
  }
  return { count: count ?? 0, likedByMe };
}

export async function listPendingCases(): Promise<CaseRow[]> {
  if (!supabaseConfigured()) return [];
  const supa = await getSupabaseServer();
  const { data } = await supa
    .from("cases")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  return (data as CaseRow[] | null) ?? [];
}
