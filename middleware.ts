import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // We check isAdmin on the session object during the actual page load/API call
    // since the token might not have latest DB state. But the JWT callback injected id.
    // Full check is in layout.tsx.
  }

  // Protect dashboard routes
  if (pathname === "/" || pathname.startsWith("/profile") || pathname.startsWith("/trades") || pathname.startsWith("/skills") || pathname.startsWith("/notifications") || pathname.startsWith("/settings")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Check onboarding logic inside layout.tsx since middleware edge runtime can't easily query Prisma
  }

  // Protect onboarding routes
  if (pathname.startsWith("/step")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname.startsWith("/login") || pathname.startsWith("/sign-up") || pathname === "/reset-password")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/trades/:path*",
    "/skills/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/step/:path*",
    "/login",
    "/sign-up",
    "/reset-password",
  ],
};
