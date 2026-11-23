import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = [
  "/dashboard",
  "/customer",
  "/customer/dashboard",
  "/vendor",
  "/vendor/dashboard",
  "/admin",
  "/admin/dashboard",
  "/profile-settings",
  "/payment-success",
  "/payment-cancel",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customer/:path*",
    "/customer/dashboard/:path*",
    "/vendor/:path*",
    "/vendor/dashboard/:path*",
    "/admin/:path*",
    "/admin/dashboard/:path*",
    "/profile-settings/:path*",
    "/payment-success/:path*",
    "/payment-cancel/:path*",
  ],
};
