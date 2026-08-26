import Link from "next/link";
import { formatCents } from "@/lib/money";

export type VehicleCardProps = {
  make: string;
  model: string;
  year: number;
  weeklyRateCents: number;
  category: string;
  location?: string;
  imageUrl?: string;
  href: string;
};

export function VehicleCard({
  make,
  model,
  year,
  weeklyRateCents,
  category,
  location,
  imageUrl,
  href,
}: VehicleCardProps) {
  return (
    <Link
      href={href}
      className="group block border-t border-line pt-6 transition hover:border-gold"
    >
      <div className="relative mb-5 aspect-[16/10] overflow-hidden bg-ink-elevated">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${year} ${make} ${model}`}
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-end bg-cover bg-center p-5"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(7,7,7,0.2), rgba(7,7,7,0.85)), url(/og.png)",
            }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
              Permanence fleet
            </span>
          </div>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{category}</p>
      <h3 className="display mt-2 text-2xl text-cream group-hover:text-gold-bright">
        {year} {make} {model}
      </h3>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <p className="text-cream">
          <span className="text-lg text-gold-bright">
            {formatCents(weeklyRateCents, { compact: true })}
          </span>
          <span className="text-mist"> / week</span>
        </p>
        {location ? <p className="text-mist">{location}</p> : null}
      </div>
    </Link>
  );
}
