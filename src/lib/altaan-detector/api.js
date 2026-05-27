/* ================================================================
   ALTAAN DETECTOR — Backend client (Next.js proxied edition)
   ----------------------------------------------------------------
   Wraps fetch() to /api/detector/* paths on the main site, which are
   transparently proxied to https://detector.maytham-altaan.com/api/*
   via Next.js rewrites (see next.config.ts). Auth token lives in
   localStorage and is sent as Bearer header on every request.
   ================================================================ */

const TOKEN_KEY = "altaan_token";
const API_BASE = "/api/detector";

export function getToken() {
  try {
    return typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;
  } catch {
    return null;
  }
}

export function setToken(t) {
  try {
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

async function call(path, opts = {}) {
  const headers = {
    "content-type": "application/json",
    ...(opts.headers || {}),
  };
  const token = getToken();
  if (token) headers.authorization = "Bearer " + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const err = new Error((json && json.error) || res.statusText);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/* POST a sentence (or paragraph) for AI rewrite. Returns { rewritten, usage }. */
export function rewriteSentence(text, style = "neutral") {
  return call("/rewrite", {
    method: "POST",
    body: JSON.stringify({ text, style }),
  });
}

/* Current user info (plan, usage, email). Returns null if not signed in. */
export async function getMe() {
  if (!getToken()) return null;
  try {
    return await call("/me", { method: "GET" });
  } catch (e) {
    if (e.status === 401) {
      setToken(null);
      return null;
    }
    throw e;
  }
}

export function sendMagicLink(email) {
  return call("/auth/send-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyMagicLink(token) {
  return call("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function startCheckout(plan = "monthly") {
  return call("/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

/* Iraqi manual-approval payment flow */
export function submitUpgradeRequest({ method, reference, amount, notes }) {
  return call("/upgrade/request", {
    method: "POST",
    body: JSON.stringify({ method, reference, amount, notes }),
  });
}
