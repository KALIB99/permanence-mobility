import { PortalShell } from "@/components/PortalShell";
import { requireSignedIn } from "@/lib/portal-auth";
import { ADMIN_PORTAL_NAV } from "@/lib/portal-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSignedIn();

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
