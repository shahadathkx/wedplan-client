import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";

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

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });
  } catch (error) {
    console.error("[auth] Session lookup failed in route proxy", {
      pathname,
      error,
    });
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!session || session.user.isBlocked) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackURL", pathname);
    if (session?.user.isBlocked) {
      signInUrl.searchParams.set("blocked", "1");
    }
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(getDashboardPath(session.user.role), request.url));
  }

  const requestedRole = pathname.split("/")[1];
  if (
    (requestedRole === "customer" ||
      requestedRole === "vendor" ||
      requestedRole === "admin") &&
    requestedRole !== session.user.role
  ) {
    return NextResponse.redirect(
      new URL(getDashboardPath(session.user.role), request.url),
    );
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
