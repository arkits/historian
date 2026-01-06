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
  trustedOrigins: [
    "http://localhost:3000",
    "https://historian.archit.xyz",
    "https://historian-api.archit.xyz",
  ],
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
  },
});
