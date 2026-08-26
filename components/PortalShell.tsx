"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { isNavItemActive } from "@/lib/nav-active";

export type PortalNavItem = {
  href: string;
  label: string;
};

type PortalShellProps = {
  brandHref: string;
  title: string;
  nav: readonly PortalNavItem[];
  externalHref: string;
  externalLabel: string;
  children: React.ReactNode;
};

export function PortalShell({
  brandHref,
  title,
  nav,
  externalHref,
  externalLabel,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const navHrefs = nav.map((item) => item.href);

  return (
    <div className="min-h-screen bg-ink">
      <header className="shell-nav">
        <div className="container-pm flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <BrandMark compact href={brandHref} />
            <p className="hidden text-xs uppercase tracking-[0.18em] text-mist sm:block">{title}</p>
          </div>
          <Link href={externalHref} className="text-sm text-mist hover:text-gold">
            {externalLabel}
          </Link>
        </div>
        <nav
          className="container-pm flex gap-1 overflow-x-auto pb-3"
          aria-label={`${title} navigation`}
        >
          {nav.map((item) => {
            const active = isNavItemActive(pathname, item.href, navHrefs);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-tab nav-tab-active" : "nav-tab"}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="container-pm py-10 sm:py-14">{children}</main>
    </div>
  );
}
