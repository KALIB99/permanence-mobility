/** Longest-prefix match so `/admin/partners` highlights Partners, not Dashboard. */
export function isNavItemActive(
  pathname: string,
  href: string,
  allHrefs: readonly string[],
): boolean {
  const matches = allHrefs.filter(
    (candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`),
  );
  if (matches.length === 0) return false;
  const best = matches.reduce((longest, candidate) =>
    candidate.length > longest.length ? candidate : longest,
  );
  return best === href;
}
