# Clinical Case Library — Auth Email Setup (Resend SMTP)

## Why
Supabase's built-in email service is capped at **2 emails/hour** and its templates
are locked. The Case Library needs reliable, cross-device magic-link sign-in for
commenters and reviewers, so we route auth emails through **Resend** (custom SMTP).

## Resend domain
- Domain: `maytham-altaan.com`, region **Ireland (eu-west-1)**
- DNS records added at Namecheap (Advanced DNS):
  | Type | Host | Value | Priority |
  |------|------|-------|----------|
  | TXT  | `resend._domainkey` | `p=MIGfMA0…IDAQAB` (DKIM, copy-pasted from Resend) | — |
  | MX   | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
  | TXT  | `send` | `v=spf1 include:amazonses.com ~all` | — |
  | TXT  | `_dmarc` | `v=DMARC1; p=none;` | — |

## Supabase SMTP (Auth → Emails → SMTP Settings)
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: Resend API key (`re_…`)
- Sender email: `noreply@maytham-altaan.com`
- Sender name: `Maytham Altaan — Clinical Case Library`

After enabling custom SMTP, the rate limit becomes editable — raise
"Rate limit for sending emails" from 2/h to e.g. 100/h.

## Email templates (Auth → Emails → Templates)
Both templates point to the cross-device `/auth/confirm` route, which calls
`verifyOtp({ token_hash, type })` server-side and sets cookies — works on any
device (no PKCE code-verifier needed).

### Magic Link (a.k.a. "Magic link or OTP")
```html
<h2>Sign in to the Clinical Case Library</h2>
<p>Click below to securely sign in. This link works on any device and expires in 1 hour.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/en/cases">Sign in</a></p>
<p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
<p style="color:#666;font-size:13px">— Maytham Altaan · maytham-altaan.com</p>
```

### Confirm signup
```html
<h2>Confirm your email</h2>
<p>Thanks for joining the Clinical Case Library. Confirm your email to finish signing in. This link works on any device.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/en/cases">Confirm email</a></p>
<p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
<p style="color:#666;font-size:13px">— Maytham Altaan · maytham-altaan.com</p>
```

## Routes
- `src/app/auth/confirm/route.ts` — token_hash + verifyOtp (cross-device, cookie session)
- `src/app/auth/callback/route.ts` — PKCE code-exchange fallback (same-browser)
- Both exempted from i18n locale-prefix via `src/middleware.ts` matcher (`auth` excluded).
