import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user, session, account, verification } from "../src/lib/schema";
import { eq } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/historian2";

function randomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

describe("Better Auth Integration Tests", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should sign up a new user successfully", async () => {
    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
      emailAndPassword: { enabled: true },
      advanced: { cookiePrefix: "test" },
    });

    const email = `test_${randomId()}@example.com`;
    const result = await auth.api.signUpEmail({
      body: { name: "Test User", email, password: "testpassword123" },
    }) as any;

    expect(result.user).not.toBeNull();
    expect(result.user.email).toBe(email);
    expect(result.user.name).toBe("Test User");
    expect(result.user.emailVerified).toBe(false);
  });

  it("should sign in with correct credentials", async () => {
    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
      emailAndPassword: { enabled: true },
      advanced: { cookiePrefix: "test" },
    });

    const email = `test_${randomId()}@example.com`;
    const password = "testpassword123";

    await auth.api.signUpEmail({ body: { name: "Test User", email, password } });

    const signInResult = await auth.api.signInEmail({ body: { email, password } }) as any;

    expect(signInResult).not.toBeNull();
    expect(signInResult.user).not.toBeNull();
  });

  it("should create session after sign in", async () => {
    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
      emailAndPassword: { enabled: true },
      advanced: { cookiePrefix: "test" },
    });

    const email = `test_${randomId()}@example.com`;
    const password = "testpassword123";

    await auth.api.signUpEmail({ body: { name: "Test User", email, password } });
    await auth.api.signInEmail({ body: { email, password } });

    const sessions = await db.select().from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(user.email, email));

    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].session.token).toBeDefined();
    expect(sessions[0].session.expiresAt).toBeDefined();
  });

  it("should sign out successfully", async () => {
    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
      emailAndPassword: { enabled: true },
      advanced: { cookiePrefix: "test" },
    });

    const email = `test_${randomId()}@example.com`;
    const password = "testpassword123";

    await auth.api.signUpEmail({ body: { name: "Test User", email, password } });
    await auth.api.signInEmail({ body: { email, password } });

    const signOutResult = await auth.api.signOut({ headers: new Headers() }) as any;

    expect(signOutResult.success).toBe(true);
  });

  it("should reject sign in with wrong password", async () => {
    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
      emailAndPassword: { enabled: true },
      advanced: { cookiePrefix: "test" },
    });

    const email = `test_${randomId()}@example.com`;
    const password = "testpassword123";

    await auth.api.signUpEmail({ body: { name: "Test User", email, password } });

    try {
      await auth.api.signInEmail({ body: { email, password: "wrongpassword" } });
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toContain("email or password");
    }
  });
});
