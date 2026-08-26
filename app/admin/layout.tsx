import { PortalShell } from "@/components/PortalShell";
import { ADMIN_PORTAL_NAV } from "@/lib/portal-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      brandHref="/admin"
      title="Admin"
      nav={ADMIN_PORTAL_NAV}
      externalHref="/"
      externalLabel="Marketing site"
    >
      {children}
    </PortalShell>
  );
}
