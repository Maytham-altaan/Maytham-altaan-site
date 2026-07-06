/**
 * Mint a real, citable DOI for a clinical case by publishing its PDF to Zenodo
 * (which registers a DataCite DOI). Flow: create deposition → upload the case
 * PDF → set metadata → publish. Returns the DOI + the public record URL.
 *
 * Config (Vercel env):
 *   ZENODO_TOKEN     — personal access token with scopes deposit:write + deposit:actions
 *   ZENODO_API_BASE  — optional; default https://zenodo.org/api
 *                      (use https://sandbox.zenodo.org/api to test — issues 10.5072 test DOIs)
 */

import type { CaseRow } from "./types";

const ZENODO_BASE = process.env.ZENODO_API_BASE || "https://zenodo.org/api";
const SITE = "https://maytham-altaan.com";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function creators(c: CaseRow): Array<Record<string, string>> {
  const anonymous = !c.show_author;
  const name = anonymous ? "Anonymous contributor" : c.submitter_name || "Anonymous contributor";
  const creator: Record<string, string> = { name };
  if (!anonymous && c.submitter_affiliation) creator.affiliation = c.submitter_affiliation;
  if (!anonymous && c.submitter_orcid) {
    const orcid = c.submitter_orcid.replace(/^https?:\/\/orcid\.org\//, "").trim();
    if (/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid)) creator.orcid = orcid;
  }
  return [creator];
}

function description(c: CaseRow): string {
  const sec = (title: string, body?: string | null) =>
    body ? `<p><strong>${title}:</strong> ${esc(body)}</p>` : "";
  return [
    `<p>${esc(c.summary_en)}</p>`,
    sec("Presentation", c.presentation),
    sec("Investigations", c.investigations),
    sec("Diagnosis", c.diagnosis),
    sec("Treatment", c.treatment),
    sec("Outcome", c.case_outcome),
    sec("Learning points", c.learning_points),
    sec("References", c.references_text),
    `<p><em>Peer-reviewed clinical case report published in the Clinical Case Library — ` +
      `<a href="${SITE}/en/cases/${esc(c.slug)}">${SITE}/en/cases/${esc(c.slug)}</a></em></p>`,
  ].join("");
}

function metadata(c: CaseRow): Record<string, unknown> {
  const keywords = [c.specialty, c.case_type, c.drug].filter(Boolean) as string[];
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: c.title_en,
    upload_type: "publication",
    publication_type: "article",
    description: description(c),
    creators: creators(c),
    access_right: "open",
    license: "cc-by-4.0",
    keywords,
    publication_date: today,
    notes: "Clinical Case Library, Maytham Altaan. Reviewed by a clinical committee before publication.",
  };
}

async function detail(res: Response): Promise<string> {
  return (await res.text().catch(() => "")).slice(0, 300);
}

export async function mintZenodoDoi(
  c: CaseRow,
  pdf: Buffer
): Promise<{ doi: string; recordUrl: string }> {
  const token = process.env.ZENODO_TOKEN;
  if (!token) {
    throw new Error(
      "ZENODO_TOKEN is not configured. Add it in Vercel Project Settings → Environment Variables."
    );
  }
  const auth = { Authorization: `Bearer ${token}` };

  // 1. Create an empty deposition.
  const createRes = await fetch(`${ZENODO_BASE}/deposit/depositions`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!createRes.ok) throw new Error(`Zenodo create ${createRes.status}: ${await detail(createRes)}`);
  const dep = (await createRes.json()) as { id: number; links: { bucket: string } };
  const bucket = dep.links?.bucket;
  if (!bucket) throw new Error("Zenodo create: no bucket URL returned");

  // 2. Upload the case PDF into the deposition's file bucket.
  const filename = `${c.slug || "case"}.pdf`;
  const upRes = await fetch(`${bucket}/${encodeURIComponent(filename)}`, {
    method: "PUT",
    headers: { ...auth, "Content-Type": "application/octet-stream" },
    body: new Uint8Array(pdf),
  });
  if (!upRes.ok) throw new Error(`Zenodo upload ${upRes.status}: ${await detail(upRes)}`);

  // 3. Attach metadata.
  const metaRes = await fetch(`${ZENODO_BASE}/deposit/depositions/${dep.id}`, {
    method: "PUT",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ metadata: metadata(c) }),
  });
  if (!metaRes.ok) throw new Error(`Zenodo metadata ${metaRes.status}: ${await detail(metaRes)}`);

  // 4. Publish — this registers the DOI.
  const pubRes = await fetch(`${ZENODO_BASE}/deposit/depositions/${dep.id}/actions/publish`, {
    method: "POST",
    headers: { ...auth },
  });
  if (!pubRes.ok) throw new Error(`Zenodo publish ${pubRes.status}: ${await detail(pubRes)}`);
  const published = (await pubRes.json()) as {
    doi?: string;
    links?: { record_html?: string; doi?: string };
  };

  const doi = published.doi || "";
  if (!doi) throw new Error("Zenodo published but returned no DOI");
  const recordUrl = published.links?.record_html || `https://doi.org/${doi}`;
  return { doi, recordUrl };
}
