import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/lib/schema";

export const auth = betterAuth({
  baseURL: "https://historian-api.archit.xyz",
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
  advanced: {
    cookiePrefix: "historian",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: "archit.xyz",
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    secret: process.env.AUTH_SECRET || "secret",
  },
});
