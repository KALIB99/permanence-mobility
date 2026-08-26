import { PortalShell } from "@/components/PortalShell";
import { PARTNER_PORTAL_NAV } from "@/lib/portal-nav";

export default function PartnerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      brandHref="/partners/portal"
      title="Partner portal"
      nav={PARTNER_PORTAL_NAV}
      externalHref="/partners"
      externalLabel="Partner marketing"
    >
      {children}
    </PortalShell>
  );
}
