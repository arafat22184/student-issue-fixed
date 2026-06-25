import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request) {
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (err) {
    // Session cookie is invalid or malformed (e.g. a stale JWT left over from
    // a previous cookieCache configuration). Treat as unauthenticated so we
    // redirect to /signin, which replaces the bad cookie with a fresh one.
    console.warn("[middleware] Malformed session cookie — clearing and redirecting to signin:", err.message);
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    const response = NextResponse.redirect(signInUrl);
    // Explicitly expire the bad cookie so the browser drops it
    response.cookies.set("better-auth.session_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("better-auth.session_data",  "", { maxAge: 0, path: "/" });
    return response;
  }

  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*", "/lesson/:path*"],
};