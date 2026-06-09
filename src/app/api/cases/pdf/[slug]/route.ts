import { NextRequest } from "next/server";
import { getApprovedCaseBySlug } from "@/lib/cases/queries";
import { renderCasePdf } from "@/lib/cases/casePdf";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const c = await getApprovedCaseBySlug(slug);
  if (!c) return new Response("Not found", { status: 404 });

  const buf = await renderCasePdf(c);
  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${slug}.pdf"`,
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
