import { PortalShell } from "@/components/PortalShell";
import { requireSignedIn } from "@/lib/portal-auth";
import { PARTNER_PORTAL_NAV } from "@/lib/portal-nav";

export const dynamic = "force-dynamic";

export default async function PartnerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSignedIn();

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
