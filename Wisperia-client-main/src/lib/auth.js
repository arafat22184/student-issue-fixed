import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";

// MongoDB client creation
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("wisperia");

export const auth = betterAuth({
baseURL: process.env.BETTER_AUTH_URL, 
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  // Social provider logic kept intact
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,        // only settable by server/admin
      },
      plan: {
        type: "string",
        defaultValue: "free",
        input: false,        // only settable by server/admin
      },
    },
  },
  session: {
    // cookieCache disabled — it bakes user data (including `plan`) into a
    // signed JWT cookie valid for hours. When the Stripe webhook upgrades the
    // user to premium in MongoDB, the old JWT is still served from the cookie
    // and useSession() keeps returning plan: "free" until the cookie expires.
    // Without cookieCache every getSession() hits the DB and returns live data.
    cookieCache: {
      enabled: false,
    },
  },
  plugins: [jwt()],
});