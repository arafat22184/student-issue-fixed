import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { jwt,bearer } from "better-auth/plugins";

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
      },
      plan: {
        type: "string", 
        defaultValue: "free",
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 60 * 24 * 60, 
    },
  },
  plugins: [jwt()],
});