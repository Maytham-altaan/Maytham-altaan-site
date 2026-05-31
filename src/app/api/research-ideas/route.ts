import { NextRequest, NextResponse } from "next/server";
import {
  generateResearchIdeas,
  checkRateLimit,
  type ResearchInput,
  type StudyDesign,
} from "@/lib/research-ideas";

// Edge runtime would be faster, but Groq SDK + 60s timeout is fine on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limit",
        message:
          "You've reached the hourly limit of 5 generations. Try again later.",
        resetAt: rl.resetAt,
      },
      { status: 429 }
    );
  }

  let body: Partial<ResearchInput>;
  try {
    body = (await req.json()) as Partial<ResearchInput>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad_json" },
      { status: 400 }
    );
  }

  const specialty = (body.specialty || "").toString().trim();
  if (!specialty) {
    return NextResponse.json(
      { ok: false, error: "specialty_required" },
      { status: 400 }
    );
  }

  const allowedDesigns: StudyDesign[] = [
    "any",
    "rct",
    "cohort",
    "case-control",
    "cross-sectional",
    "case-series",
    "systematic-review",
    "qualitative",
  ];
  const studyDesign: StudyDesign = allowedDesigns.includes(
    body.studyDesign as StudyDesign
  )
    ? (body.studyDesign as StudyDesign)
    : "any";

  const input: ResearchInput = {
    specialty,
    subspecialty: (body.subspecialty || "").toString().slice(0, 200),
    studyDesign,
    constraints: (body.constraints || "").toString().slice(0, 500),
    locale: (body.locale || "en").toString(),
  };

  const result = await generateResearchIdeas(input);
  return NextResponse.json(
    { ...result, remaining: rl.remaining, resetAt: rl.resetAt },
    { status: result.ok ? 200 : 500 }
  );
}
