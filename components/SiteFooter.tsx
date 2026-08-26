import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BRAND, FOOTER_COLUMNS } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60 bg-ink-soft">
      <div className="container-pm grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <BrandMark />
          <p className="display text-2xl text-gold-bright">{BRAND.tagline}</p>
          <p className="text-sm text-mist">
            Weekly vehicles for approved gig workers. Managed fleet partnerships for qualified
            owners.
          </p>
          <a
            href={`mailto:${BRAND.email}`}
            className="block text-sm text-gold hover:text-gold-bright"
          >
            {BRAND.email}
          </a>
          <p className="text-sm text-mist">{BRAND.location}</p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">{column.title}</p>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-mist hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line/40">
        <div className="container-pm flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {BRAND.name}
          </span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-gold">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gold">
              Terms
            </Link>
            <Link href="/cancellation" className="hover:text-gold">
              Cancellation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
