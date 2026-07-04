import type { CvStylePreview } from "@/lib/cv/styles";

/**
 * Tiny schematic thumbnail of a CV style (not a real render) — a colour + layout
 * cue for the style picker. Drawn with divs so it stays crisp at any size.
 */

function Lines({ n, color, widths }: { n: number; color: string; widths?: string[] }) {
  return (
    <div className="space-y-[3px]">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] rounded-full"
          style={{ width: widths?.[i] ?? (i % 3 === 2 ? "55%" : "90%"), background: color }}
        />
      ))}
    </div>
  );
}

export function CvStyleThumb({ p }: { p: CvStylePreview }) {
  const faint = "rgba(0,0,0,0.14)";
  const serifFont = p.serif ? "Georgia, 'Times New Roman', serif" : "inherit";

  return (
    <div
      className="relative w-full overflow-hidden rounded-md ring-1 ring-black/10"
      style={{ aspectRatio: "210 / 285", background: p.paper }}
      aria-hidden
    >
      {p.layout === "sidebar" && (
        <div className="absolute inset-0 flex">
          <div
            className="flex h-full w-[36%] flex-col items-center gap-2 px-2 pt-3"
            style={{ background: p.primary }}
          >
            <div className="h-6 w-6 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
            <div className="mt-1 w-full space-y-[3px]">
              <div className="h-[3px] w-[80%] rounded-full" style={{ background: "rgba(255,255,255,0.55)" }} />
              <div className="h-[3px] w-[65%] rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
              <div className="h-[3px] w-[70%] rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
            </div>
          </div>
          <div className="flex-1 px-2.5 pt-3.5">
            <div className="h-[7px] w-[62%] rounded" style={{ background: p.primary, fontFamily: serifFont }} />
            <div className="mt-1 h-[3px] w-[40%] rounded-full" style={{ background: p.accent }} />
            <div className="mt-3">
              <Lines n={5} color={faint} />
            </div>
          </div>
        </div>
      )}

      {p.layout === "header" && (
        <div className="absolute inset-0">
          <div className="flex h-[30%] items-center gap-2 px-3" style={{ background: p.primary }}>
            <div className="h-6 w-6 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
            <div className="space-y-1">
              <div className="h-[6px] w-14 rounded" style={{ background: "rgba(255,255,255,0.9)" }} />
              <div className="h-[3px] w-9 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>
          <div className="px-3 pt-3">
            <div className="h-[4px] w-[30%] rounded-full" style={{ background: p.accent }} />
            <div className="mt-2">
              <Lines n={6} color={faint} />
            </div>
          </div>
        </div>
      )}

      {p.layout === "single" && (
        <div className="absolute inset-0 px-3.5 pt-4">
          <div className={p.serif ? "text-center" : ""}>
            <div
              className={`h-[8px] rounded ${p.serif ? "mx-auto w-[58%]" : "w-[52%]"}`}
              style={{ background: p.primary }}
            />
            <div
              className={`mt-1.5 h-[3px] rounded-full ${p.serif ? "mx-auto w-[34%]" : "w-[30%]"}`}
              style={{ background: p.accent }}
            />
          </div>
          <div className="mt-4 space-y-3">
            <Lines n={3} color={faint} />
            <Lines n={3} color={faint} />
          </div>
        </div>
      )}
    </div>
  );
}
