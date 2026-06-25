"use client";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Mounted inside the success Server Component.
 * Forces better-auth to drop its JWT cookie cache and re-fetch a fresh session,
 * so useSession() reflects plan: "premium" immediately without signing out.
 */
export default function SessionRefresher() {
  useEffect(() => {
    authClient.getSession({ fetchOptions: { cache: "no-store" } });
  }, []);
  return null;
}
