/// <reference types="vitest/globals" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { user, session, account, verification, history, apiKey } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { appRouter } from "@/server/router";
import { createContext } from "@/server/context";
import { auth } from "@/server/auth";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/historian2";

function randomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


describe("Router Tests", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let testUser: { id: string; email: string; name: string };
  let testSession: { token: string; headers: Headers };

  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle(pool);
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(history);
    await db.delete(apiKey);
    await db.delete(session);
    await db.delete(account);
    await db.delete(verification);
    await db.delete(user);

    // Create a test user
    const email = `test_${randomId()}@example.com`;
    const password = "testpassword123";
    const mockSignUpRequest = new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password }),
    });
    const signUpResponse = await auth.handler(mockSignUpRequest);
    const signUpResult = (await signUpResponse.json()) as any;

    testUser = {
      id: signUpResult.user.id,
      email: signUpResult.user.email,
      name: signUpResult.user.name,
    };

    // Sign in to create a session - use the same auth instance as the router
    const mockRequest = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const signInResponse = await auth.handler(mockRequest);
    
    // Extract cookies from response
    const setCookieHeaders = signInResponse.headers.getSetCookie();
    const headers = new Headers();
    
    // Set all cookies from the response
    for (const cookie of setCookieHeaders) {
      // Extract cookie name and value
      const [nameValue] = cookie.split(";");
      if (nameValue) {
        const existingCookies = headers.get("cookie") || "";
        headers.set("cookie", existingCookies ? `${existingCookies}; ${nameValue}` : nameValue);
      }
    }

    // Get the session from the database
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, testUser.id))
      .limit(1);

    testSession = {
      token: sessions[0]?.token || "",
      headers,
    };
  });

  afterAll(async () => {
    await pool.end();
  });

  async function createCallerWithHeaders(headers: Headers) {
    const ctx = await createContext(headers);
    return appRouter.createCaller(ctx);
  }

  describe("getSession", () => {
    it("should return null for unauthenticated request", async () => {
      const caller = await createCallerWithHeaders(new Headers());
      const result = await caller.getSession();
      expect(result).toBeNull();
    });

    it("should return session for authenticated request", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getSession();
      expect(result).not.toBeNull();
      expect(result?.user.id).toBe(testUser.id);
      expect(result?.user.email).toBe(testUser.email);
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.signOut();
      expect(result.success).toBe(true);
    });
  });

  describe("getUser", () => {
    it("should return user for authenticated request", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getUser();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result.name).toBe(testUser.name);
    });

    it("should throw UNAUTHORIZED for unauthenticated request", async () => {
      const caller = await createCallerWithHeaders(new Headers());
      await expect(caller.getUser()).rejects.toThrow();
    });
  });

  describe("listHistory", () => {
    it("should return empty array when no history exists", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listHistory({ limit: 10 });
      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });

    it("should return history items", async () => {
      // Create test history items
      const timelineTime = new Date().toISOString();
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime,
          type: "page",
          contentId: "content-1",
          content: { url: "https://example.com", title: "Example" },
        },
        {
          userId: testUser.id,
          timelineTime: new Date(Date.now() - 1000).toISOString(),
          type: "page",
          contentId: "content-2",
          content: { url: "https://example.com/page2", title: "Example 2" },
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listHistory({ limit: 10 });
      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.contentId).toBe("content-1");
    });

    it("should respect limit", async () => {
      // Create more items than limit
      const values = Array.from({ length: 15 }, (_, i) => ({
        userId: testUser.id,
        timelineTime: new Date(Date.now() - i * 1000).toISOString(),
        type: "page",
        contentId: `content-${i}`,
        content: { url: `https://example.com/page${i}` },
      }));
      await db.insert(history).values(values);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listHistory({ limit: 10 });
      expect(result.items).toHaveLength(10);
    });

    it("should filter by type", async () => {
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "video",
          contentId: "content-2",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listHistory({ limit: 10, type: "page" });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.type).toBe("page");
    });

    it("should only return user's own history", async () => {
      // Create another user
      const email2 = `test_${randomId()}@example.com`;
      const mockSignUpRequest = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test User 2", email: email2, password: "testpassword123" }),
      });
      const signUpResponse = await auth.handler(mockSignUpRequest);
      const signUpResult2 = (await signUpResponse.json()) as any;

      // Create history for both users
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: signUpResult2.user.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-2",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listHistory({ limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.userId).toBe(testUser.id);
    });
  });

  describe("createHistory", () => {
    it("should create a history item", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const timelineTime = new Date().toISOString();
      const result = await caller.createHistory({
        timelineTime,
        type: "page",
        contentId: "content-1",
        content: { url: "https://example.com", title: "Example" },
      });

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUser.id);
      expect(result.type).toBe("page");
      expect(result.contentId).toBe("content-1");

      // Verify it was saved
      const items = await db
        .select()
        .from(history)
        .where(eq(history.id, result.id));
      expect(items).toHaveLength(1);
    });
  });

  describe("importHistory", () => {
    it("should import multiple history items", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const timelineTime = new Date().toISOString();
      const result = await caller.importHistory([
        {
          timelineTime,
          type: "page",
          contentId: "content-1",
          content: { url: "https://example.com" },
        },
        {
          timelineTime,
          type: "page",
          contentId: "content-2",
          content: { url: "https://example.com/page2" },
        },
      ]);

      expect(result.imported).toBe(2);

      // Verify items were saved
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(2);
    });
  });

  describe("getHistoryById", () => {
    it("should return history item by id", async () => {
      const timelineTime = new Date().toISOString();
      const [inserted] = await db
        .insert(history)
        .values({
          userId: testUser.id,
          timelineTime,
          type: "page",
          contentId: "content-1",
          content: { url: "https://example.com" },
        })
        .returning();

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryById({ id: inserted.id });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(inserted.id);
      expect(result?.contentId).toBe("content-1");
    });

    it("should return null for non-existent id", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryById({
        id: "00000000-0000-0000-0000-000000000000",
      });
      expect(result).toBeNull();
    });

    it("should return null for another user's history", async () => {
      // Create another user
      const email2 = `test_${randomId()}@example.com`;
      const mockSignUpRequest = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test User 2", email: email2, password: "testpassword123" }),
      });
      const signUpResponse = await auth.handler(mockSignUpRequest);
      const signUpResult2 = (await signUpResponse.json()) as any;

      const timelineTime = new Date().toISOString();
      const [inserted] = await db
        .insert(history)
        .values({
          userId: signUpResult2.user.id,
          timelineTime,
          type: "page",
          contentId: "content-1",
          content: {},
        })
        .returning();

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryById({ id: inserted.id });
      expect(result).toBeNull();
    });
  });

  describe("deleteHistory", () => {
    it("should delete a history item", async () => {
      const timelineTime = new Date().toISOString();
      const [inserted] = await db
        .insert(history)
        .values({
          userId: testUser.id,
          timelineTime,
          type: "page",
          contentId: "content-1",
          content: {},
        })
        .returning();

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.deleteHistory({ id: inserted.id });

      expect(result.success).toBe(true);

      // Verify it was deleted
      const items = await db
        .select()
        .from(history)
        .where(eq(history.id, inserted.id));
      expect(items).toHaveLength(0);
    });
  });

  describe("clearAllHistory", () => {
    it("should delete all user's history", async () => {
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-2",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.clearAllHistory();

      expect(result.success).toBe(true);

      // Verify all history was deleted
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(0);
    });
  });

  describe("getHistoryStats", () => {
    it("should return correct stats", async () => {
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "video",
          contentId: "content-2",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-3",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryStats();

      expect(result.totalCount).toBe(3);
      expect(result.byType).toHaveLength(2);
      const pageType = result.byType.find((t) => t.type === "page");
      const videoType = result.byType.find((t) => t.type === "video");
      expect(pageType?.count).toBe(2);
      expect(videoType?.count).toBe(1);
    });
  });

  describe("getHistoryTypes", () => {
    it("should return distinct types", async () => {
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "video",
          contentId: "content-2",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-3",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryTypes();

      expect(result).toHaveLength(2);
      expect(result).toContain("page");
      expect(result).toContain("video");
    });
  });

  describe("getHistoryByDateRange", () => {
    it("should return history grouped by date", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: today.toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: today.toISOString(),
          type: "page",
          contentId: "content-2",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: yesterday.toISOString(),
          type: "page",
          contentId: "content-3",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const startDate = yesterday.toISOString().split("T")[0];
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      const result = await caller.getHistoryByDateRange({
        startDate: startDate,
        endDate: endDate.toISOString().split("T")[0],
      });

      expect(result.length).toBeGreaterThan(0);
      const totalCount = result.reduce((sum, r) => sum + r.count, 0);
      expect(totalCount).toBe(3);
    });
  });

  describe("getRecentVisits", () => {
    it("should return recent visits", async () => {
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {
            url: "https://example.com",
            title: "Example",
            domain: "example.com",
          },
        },
        {
          userId: testUser.id,
          timelineTime: new Date(Date.now() - 1000).toISOString(),
          type: "page",
          contentId: "content-2",
          content: {
            url: "https://example.com/page2",
            title: "Example 2",
            domain: "example.com",
          },
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getRecentVisits({ limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0]?.url).toBe("https://example.com");
      expect(result[0]?.title).toBe("Example");
      expect(result[0]?.domain).toBe("example.com");
    });

    it("should respect limit", async () => {
      const values = Array.from({ length: 15 }, (_, i) => ({
        userId: testUser.id,
        timelineTime: new Date(Date.now() - i * 1000).toISOString(),
        type: "page",
        contentId: `content-${i}`,
        content: {
          url: `https://example.com/page${i}`,
          title: `Page ${i}`,
          domain: "example.com",
        },
      }));
      await db.insert(history).values(values);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getRecentVisits({ limit: 5 });
      expect(result).toHaveLength(5);
    });
  });

  describe("getExtensionStats", () => {
    it("should return extension stats", async () => {
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content-2",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getExtensionStats();

      expect(result.totalSynced).toBe(2);
    });
  });

  describe("getHistoryByDate", () => {
    it("should return history for a specific date", async () => {
      const date = new Date("2024-01-15T12:00:00Z");
      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: date.toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date(date.getTime() + 3600000).toISOString(),
          type: "page",
          contentId: "content-2",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryByDate({ date: "2024-01-15" });

      expect(result).toHaveLength(2);
    });
  });

  describe("getHistoryItemsByDateRange", () => {
    it("should return history items in date range", async () => {
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-01-17");

      await db.insert(history).values([
        {
          userId: testUser.id,
          timelineTime: new Date("2024-01-15T12:00:00Z").toISOString(),
          type: "page",
          contentId: "content-1",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date("2024-01-16T12:00:00Z").toISOString(),
          type: "page",
          contentId: "content-2",
          content: {},
        },
        {
          userId: testUser.id,
          timelineTime: new Date("2024-01-18T12:00:00Z").toISOString(),
          type: "page",
          contentId: "content-3",
          content: {},
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.getHistoryItemsByDateRange({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      expect(result).toHaveLength(2);
      expect(result[0]?.contentId).toBe("content-2");
      expect(result[1]?.contentId).toBe("content-1");
    });
  });

  describe("listApiKeys", () => {
    it("should return empty array when no API keys exist", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listApiKeys();
      expect(result).toEqual([]);
    });

    it("should return user's API keys", async () => {
      await db.insert(apiKey).values([
        {
          userId: testUser.id,
          key: "key-1",
          name: "Test Key 1",
        },
        {
          userId: testUser.id,
          key: "key-2",
          name: "Test Key 2",
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listApiKeys();

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("Test Key 1");
      expect(result[1]?.name).toBe("Test Key 2");
    });

    it("should only return user's own API keys", async () => {
      // Create another user
      const email2 = `test_${randomId()}@example.com`;
      const mockSignUpRequest = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test User 2", email: email2, password: "testpassword123" }),
      });
      const signUpResponse = await auth.handler(mockSignUpRequest);
      const signUpResult2 = (await signUpResponse.json()) as any;

      await db.insert(apiKey).values([
        {
          userId: testUser.id,
          key: "key-1",
          name: "Test Key 1",
        },
        {
          userId: signUpResult2.user.id,
          key: "key-2",
          name: "Other User Key",
        },
      ]);

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.listApiKeys();

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("Test Key 1");
    });
  });

  describe("createApiKey", () => {
    it("should create an API key", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.createApiKey({ name: "My API Key" });

      expect(result).toBeDefined();
      expect(result.name).toBe("My API Key");
      expect(result.userId).toBe(testUser.id);
      expect(result.key).toBeDefined();
      expect(result.key.length).toBeGreaterThan(0);
    });
  });

  describe("deleteApiKey", () => {
    it("should delete an API key", async () => {
      const [inserted] = await db
        .insert(apiKey)
        .values({
          userId: testUser.id,
          key: "test-key",
          name: "Test Key",
        })
        .returning();

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.deleteApiKey({ id: inserted.id });

      expect(result.success).toBe(true);

      // Verify it was deleted
      const keys = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, inserted.id));
      expect(keys).toHaveLength(0);
    });
  });

  describe("toggleApiKey", () => {
    it("should toggle API key active status", async () => {
      const [inserted] = await db
        .insert(apiKey)
        .values({
          userId: testUser.id,
          key: "test-key",
          name: "Test Key",
          isActive: true,
        })
        .returning();

      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.toggleApiKey({ id: inserted.id, isActive: false });

      expect(result.success).toBe(true);

      // Verify it was updated
      const [key] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, inserted.id));
      expect(key?.isActive).toBe(false);
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const caller = await createCallerWithHeaders(testSession.headers);
      const result = await caller.changePassword({
        currentPassword: "testpassword123",
        newPassword: "newpassword123",
      });

      expect(result.success).toBe(true);

      // Verify password was changed by trying to sign in with new password
      const mockSignInRequest = new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testUser.email, password: "newpassword123" }),
      });
      const signInResponse = await auth.handler(mockSignInRequest);
      expect(signInResponse.status).toBe(200);
    });
  });
});
