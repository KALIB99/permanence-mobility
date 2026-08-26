import type { PortalNavItem } from "@/components/PortalShell";

export const PARTNER_PORTAL_NAV: PortalNavItem[] = [
  { href: "/partners/portal", label: "Overview" },
  { href: "/partners/portal/vehicles", label: "Vehicles" },
  { href: "/partners/portal/reservations", label: "Reservations" },
  { href: "/partners/portal/maintenance", label: "Maintenance" },
  { href: "/partners/portal/earnings", label: "Earnings" },
  { href: "/partners/portal/team", label: "Team" },
  { href: "/partners/portal/documents", label: "Documents" },
];

export const ADMIN_PORTAL_NAV: PortalNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/renters", label: "Renters" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/inspections", label: "Inspections" },
  { href: "/admin/maintenance", label: "Maintenance" },
  { href: "/admin/fees", label: "Fees" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/audit", label: "Audit" },
];

export const RENTER_PORTAL_NAV: PortalNavItem[] = [
  { href: "/renter", label: "Overview" },
  { href: "/renter/application", label: "Application" },
  { href: "/renter/documents", label: "Documents" },
  { href: "/renter/rentals", label: "Rentals" },
  { href: "/renter/inspections", label: "Inspections" },
  { href: "/renter/payments", label: "Payments" },
  { href: "/renter/support", label: "Support" },
];
