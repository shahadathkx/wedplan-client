import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/roles";

const protectedPaths = [
  "/dashboard",
  "/customer/dashboard",
  "/vendor/dashboard",
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

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.isBlocked) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackURL", pathname);
    if (session?.user.isBlocked) {
      signInUrl.searchParams.set("blocked", "1");
    }
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(dashboardPath(session.user.role), request.url));
  }

  const requestedRole = pathname.split("/")[1];
  if (
    (requestedRole === "customer" ||
      requestedRole === "vendor" ||
      requestedRole === "admin") &&
    requestedRole !== session.user.role
  ) {
    return NextResponse.redirect(
      new URL(dashboardPath(session.user.role), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customer/dashboard/:path*",
    "/vendor/dashboard/:path*",
    "/admin/dashboard/:path*",
    "/profile-settings/:path*",
    "/payment-success/:path*",
    "/payment-cancel/:path*",
  ],
};
