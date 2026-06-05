import { type EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Cross-device-safe magic-link confirmation.
// Supabase email templates point here with ?token_hash=...&type=...&next=...
// verifyOtp() exchanges the hashed token for a session WITHOUT needing a
// PKCE code-verifier in the browser, so the link works even if opened on a
// different device (e.g. requested on desktop, clicked on phone).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/en/cases";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/en/cases/auth?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/en/cases/auth?error=missing_token`
  );
}
