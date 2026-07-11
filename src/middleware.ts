import { NextResponse, type NextRequest } from "next/server";

/**
 * Prva linija obrane za /admin rute: bez session cookieja → login.
 * Stvarna provjera potpisa sessiona radi se server-side u admin layoutu
 * i u svakoj admin akciji (requireAdmin).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("festko_admin_session");
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
