import { PortalShell } from "@/components/PortalShell";
import { requireSignedIn } from "@/lib/portal-auth";
import { RENTER_PORTAL_NAV } from "@/lib/portal-nav";

export const dynamic = "force-dynamic";

export default async function RenterLayout({ children }: { children: React.ReactNode }) {
  await requireSignedIn();

  return (
    <PortalShell
      brandHref="/renter"
      title="Renter"
      nav={RENTER_PORTAL_NAV}
      externalHref="/vehicles"
      externalLabel="Find a Gig Car"
    >
      {children}
    </PortalShell>
  );
}
