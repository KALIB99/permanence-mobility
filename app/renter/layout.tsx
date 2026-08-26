import { PortalShell } from "@/components/PortalShell";
import { RENTER_PORTAL_NAV } from "@/lib/portal-nav";

export default function RenterLayout({ children }: { children: React.ReactNode }) {
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
