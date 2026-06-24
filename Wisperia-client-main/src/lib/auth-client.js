import { createAuthClient } from "better-auth/react";
import { jwtClient, adminClient } from "better-auth/client/plugins";


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL, 
  plugins: [
    jwtClient(),   
    adminClient()
  ],
});

/**
 * Get a JWT token from better-auth's JWT plugin endpoint (GET /api/auth/token).
 * Use this wherever you need a Bearer token to call the backend API.
 * Replaces the incorrect authClient.getAccessToken() which targets the OAuth
 * provider endpoint (/get-access-token) and requires a providerId.
 */
export async function getToken() {
  const result = await authClient.$fetch("/token");
  return result?.data?.token ?? null;
}

export const { signIn, signUp, signOut, useSession } = authClient;