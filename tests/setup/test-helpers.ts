import { user, session } from "@/lib/schema";
import { createTRPCHandler } from "@/server/handler";

function randomId() {
  return Math.random().toString(36).slice(2);
}

function toCookieHeader(existing: string, setCookie: string) {
  const [nameValue] = setCookie.split(";");
  if (!nameValue) return existing;
  return existing ? `${existing}; ${nameValue}` : nameValue;
}

export async function createTestSession(db: any): Promise<{
  user: any;
  session: any;
  token: string;
}> {
  const now = new Date().toISOString();
  const userInsert = {
    id: `test_user_${Date.now()}_${randomId()}`,
    name: "Test User",
    email: `test_${Date.now()}_${randomId()}@example.com`,
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  };

  const [dbUser] = await db.insert(user).values(userInsert).returning();

  const token = `test_token_${Date.now()}_${randomId()}`;
  const sessionInsert = {
    id: `test_sess_${Date.now()}_${randomId()}`,
    userId: dbUser.id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
  };

  const [dbSession] = await db.insert(session).values(sessionInsert).returning();

  return { user: dbUser, session: dbSession, token };
}

export async function createTestClient(): Promise<{
  signUp: (email: string, password: string) => Promise<Response>;
  signIn: (email: string, password: string) => Promise<Response>;
  request: (path: string, options?: RequestInit) => Promise<Response>;
}> {
  const handler = createTRPCHandler();
  let cookieHeader = "";

  async function request(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    if (cookieHeader) headers.set("cookie", cookieHeader);

    const req = new Request(`http://localhost:3000${path}`, {
      ...options,
      headers,
    });
    const res = await handler(req);

    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const setCookie of setCookies) {
      cookieHeader = toCookieHeader(cookieHeader, setCookie);
    }

    return res;
  }

  async function signUp(email: string, password: string) {
    return request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password }),
    });
  }

  async function signIn(email: string, password: string) {
    return request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }

  return { signUp, signIn, request };
}

export function createTestApiKey(userId: string): string {
  return `hist_test_${userId}_${Date.now()}_${randomId()}`;
}
