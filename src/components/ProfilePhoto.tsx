import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const PHOTO_PATH = "/maytham.jpg";

export function ProfilePhoto({
  size = 480,
  className = "",
  rounded = "rounded-3xl",
}: {
  size?: number;
  className?: string;
  rounded?: string;
}) {
  const absPath = path.join(process.cwd(), "public", "maytham.jpg");
  const exists = fs.existsSync(absPath);

  if (exists) {
    return (
      <Image
        src={PHOTO_PATH}
        alt="Dr. Maytham Altaan"
        width={size}
        height={size}
        priority
        className={`${rounded} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${rounded} bg-gradient-to-br from-[var(--color-brand-100)] via-[var(--color-background)] to-[var(--color-accent-100)] ${className}`}
      style={{ width: size, height: size }}
      aria-label="Profile photo placeholder"
    >
      <div className="text-center">
        <div className="text-6xl font-semibold tracking-tight text-[var(--color-brand-700)]">
          M.A.
        </div>
        <div className="mt-2 text-xs text-[var(--color-muted)]">
          add public/maytham.jpg
        </div>
      </div>
    </div>
  );
}
