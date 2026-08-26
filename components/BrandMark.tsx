import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function BrandMark({ href = "/", compact = false, className = "" }: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 text-cream no-underline ${className}`}
      aria-label="Permanence Mobility home"
    >
      <Image
        src="/logo.svg"
        alt=""
        width={compact ? 36 : 44}
        height={compact ? 36 : 44}
        className="shrink-0"
        priority
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-medium tracking-[0.18em] text-cream group-hover:text-gold-bright ${
            compact ? "text-[11px]" : "text-xs"
          }`}
        >
          PERMANENCE
        </span>
        <span
          className={`mt-1 tracking-[0.28em] text-gold ${compact ? "text-[9px]" : "text-[10px]"}`}
        >
          MOBILITY
        </span>
      </span>
    </Link>
  );
}
