"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { NAV_LINKS } from "@/lib/content";
import { isNavItemActive } from "@/lib/nav-active";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navHrefs = NAV_LINKS.map((link) => link.href);

  return (
    <header className="shell-nav">
      <div className="container-pm flex items-center justify-between gap-4 py-4">
        <BrandMark compact />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = isNavItemActive(pathname, link.href, navHrefs);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "nav-link nav-link-active pb-1" : "nav-link pb-1"}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="btn-ghost !py-2.5 !px-4 text-sm">
            Sign in
          </Link>
          <Link href="/apply" className="btn-gold !py-2.5 !px-4 text-sm">
            Apply
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm border border-line px-3 py-2 text-sm text-cream lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line/60 bg-ink lg:hidden"
        >
          <nav className="container-pm flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV_LINKS.map((link) => {
              const active = isNavItemActive(pathname, link.href, navHrefs);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "nav-tab nav-tab-active !rounded-none border-x-0 border-t-0"
                      : "nav-tab !rounded-none border border-transparent"
                  }
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-line/60 pt-4">
              <Link href="/login" className="btn-ghost" onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link href="/apply" className="btn-gold" onClick={() => setOpen(false)}>
                Apply
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
