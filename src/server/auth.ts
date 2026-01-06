import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/lib/schema";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://historian-api.archit.xyz"
      : "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://historian.archit.xyz",
    "https://historian-api.archit.xyz",
  ],
  plugins: [bearer()],
  advanced: {
    cookiePrefix: "historian",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: "archit.xyz",
    },
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
    secret: process.env.AUTH_SECRET || "secret",
  },
});
