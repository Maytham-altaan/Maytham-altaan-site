import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Server client tied to the user's session via cookies. Use in Server
 *  Components and Route Handlers that need to know who is signed in. */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* Server Components can't set cookies — fine if middleware refreshes the session */
          }
        },
      },
    }
  );
}

/** Service-role client (BYPASSES RLS). Use ONLY in Route Handlers, never in
 *  components and never exposed to the browser. Required for things like
 *  inserting a pending submission from an unauthenticated visitor and
 *  writing the consent PDF into storage. */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

/** Check whether the current user is an active reviewer. */
export async function currentUserIsReviewer(): Promise<boolean> {
  const supa = await getSupabaseServer();
  const { data: userResp } = await supa.auth.getUser();
  if (!userResp.user) return false;
  const { data: reviewer } = await supa
    .from("reviewers")
    .select("id")
    .eq("user_id", userResp.user.id)
    .eq("is_active", true)
    .maybeSingle();
  return !!reviewer;
}
