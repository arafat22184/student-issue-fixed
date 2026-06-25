import { NextResponse } from "next/server";

/**
 * GET /api/clear-session
 *
 * One-time migration helper. When better-auth switched from cookieCache (JWT)
 * to standard sessions, the old JWT cookie (header.payload.signature format)
 * causes "Invalid Base64 character: ." errors because better-auth no longer
 * knows how to parse it.
 *
 * This route deletes ALL better-auth cookies by setting them to expire in the
 * past, then redirects to /signin for a fresh login.
 */
export async function GET() {
  const response = NextResponse.redirect(
    new URL("/signin", process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://wisperia-client-eta.vercel.app")
  );

  // better-auth cookie names (covers all known variants)
  const cookiesToClear = [
    "better-auth.session_token",
    "better-auth.session_data",
    "__Secure-better-auth.session_token",
    "__Host-better-auth.session_token",
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
