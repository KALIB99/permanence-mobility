import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/partners/portal", "/renter"];

/** Supabase auth cookies: sb-<project-ref>-auth-token[.N] */
function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) => cookie.name.includes("-auth-token") && cookie.value.length > 0,
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSupabaseSession(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
