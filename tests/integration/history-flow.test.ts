/// <reference types="vitest/globals" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user, session, account, verification, history } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createTRPCHandler } from "@/server/handler";
import {
  seedTestUser,
  seedTestHistoryItem,
  seedTestHistoryItems,
  cleanupAllTestData,
  closeTestPool,
} from "../setup/test-db";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian2";

describe("History Flow Integration Tests", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let auth: ReturnType<typeof betterAuth>;
  let trpcHandler: ReturnType<typeof createTRPCHandler>;
  let testUserId: string;
  let testCookies: string;

  beforeAll(async () => {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
    db = drizzle(pool);

    auth = betterAuth({
      baseURL: "http://localhost:3000",
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification },
      }),
      emailAndPassword: { enabled: true },
      trustedOrigins: ["http://localhost:3000"],
      advanced: {
        cookiePrefix: "historian",
        useSecureCookies: false,
        defaultCookieAttributes: {
          sameSite: "lax",
          secure: false,
        },
        secret: "secret",
      },
    });

    trpcHandler = createTRPCHandler();
  });

  beforeEach(async () => {
    // Clean up test data
    await cleanupAllTestData(db);

    // Create a test user and session
    const email = `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
    const password = "testpassword123";

    // Sign up using auth API
    const signUpResult = await auth.api.signUpEmail({
      body: { name: "Test User", email, password },
    }) as any;
    testUserId = signUpResult.user.id;

    // Sign in using handler to get cookies
    const signInRequest = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const signInResponse = await auth.handler(signInRequest);
    
    // Extract all cookies from response
    const setCookieHeaders = signInResponse.headers.getSetCookie();
    const cookieParts: string[] = [];
    for (const cookie of setCookieHeaders) {
      const [nameValue] = cookie.split(";");
      if (nameValue) {
        cookieParts.push(nameValue);
      }
    }
    testCookies = cookieParts.join("; ");
  });

  afterAll(async () => {
    await cleanupAllTestData(db);
    await closeTestPool();
    await pool.end();
  });

  async function makeTRPCRequest(
    procedure: string,
    input?: unknown,
    method: "GET" | "POST" = "POST",
  ) {
    const url = new URL(`http://localhost:3000/api/trpc/${procedure}`);
    if (method === "GET" && input !== undefined) {
      url.searchParams.set("input", JSON.stringify(input));
    }

    const requestInit: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: testCookies,
        Origin: "http://localhost:3000",
      },
    };

    if (method === "POST" && input !== undefined) {
      requestInit.body = JSON.stringify(input);
    }

    const request = new Request(url.toString(), requestInit);

    return trpcHandler(request);
  }

  describe("createHistory", () => {
    it("should create a single history item", async () => {
      const historyData = {
        timelineTime: new Date().toISOString(),
        type: "page",
        contentId: "content1",
        content: {
          url: "https://example.com",
          title: "Example Page",
          domain: "example.com",
        },
        searchContent: "example page",
      };

      const response = await makeTRPCRequest("createHistory", historyData);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeDefined();
      expect(result.result.data.userId).toBe(testUserId);
      expect(result.result.data.type).toBe("page");
      expect(result.result.data.contentId).toBe("content1");
      expect(result.result.data.content.url).toBe("https://example.com");
    });

    it("should create history item without searchContent", async () => {
      const historyData = {
        timelineTime: new Date().toISOString(),
        type: "page",
        contentId: "content2",
        content: {
          url: "https://test.com",
          title: "Test Page",
        },
      };

      const response = await makeTRPCRequest("createHistory", historyData);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeDefined();
      expect(result.result.data.searchContent).toBeNull();
    });

    it("should reject invalid timelineTime", async () => {
      const historyData = {
        timelineTime: "invalid-date",
        type: "page",
        contentId: "content3",
        content: { url: "https://example.com" },
      };

      const response = await makeTRPCRequest("createHistory", historyData);
      expect(response.status).toBe(400);
    });
  });

  describe("importHistory", () => {
    it("should import multiple history items", async () => {
      const items = [
        {
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content1",
          content: {
            url: "https://example.com",
            title: "Example Page",
            domain: "example.com",
          },
          searchContent: "example",
        },
        {
          timelineTime: new Date(Date.now() - 1000).toISOString(),
          type: "page",
          contentId: "content2",
          content: {
            url: "https://test.com",
            title: "Test Page",
            domain: "test.com",
          },
        },
      ];

      const response = await makeTRPCRequest("importHistory", items);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.imported).toBe(2);

      // Verify items were imported
      const importedItems = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId));
      expect(importedItems.length).toBe(2);
    });

    it("should import empty array", async () => {
      const response = await makeTRPCRequest("importHistory", []);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.imported).toBe(0);
    });
  });

  describe("listHistory", () => {
    it("should list history items with default limit", async () => {
      // Create multiple history items
      await seedTestHistoryItems(db, testUserId, 5);

      const response = await makeTRPCRequest("listHistory", {}, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.items).toBeDefined();
      expect(Array.isArray(result.result.data.items)).toBe(true);
      expect(result.result.data.items.length).toBe(5);
    });

    it("should respect limit parameter", async () => {
      await seedTestHistoryItems(db, testUserId, 10);

      const response = await makeTRPCRequest(
        "listHistory",
        { limit: 3 },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.items.length).toBe(3);
    });

    it("should filter by type", async () => {
      // Create items with different types
      await seedTestHistoryItem(db, testUserId, { type: "page" });
      await seedTestHistoryItem(db, testUserId, { type: "page" });
      await seedTestHistoryItem(db, testUserId, { type: "video" });

      const response = await makeTRPCRequest(
        "listHistory",
        { type: "page" },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.items.length).toBe(2);
      expect(result.result.data.items.every((item: any) => item.type === "page")).toBe(true);
    });

    it("should support pagination with cursor", async () => {
      await seedTestHistoryItems(db, testUserId, 5);

      // First page
      const firstResponse = await makeTRPCRequest(
        "listHistory",
        { limit: 2 },
        "GET",
      );
      const firstResult = await firstResponse.json();
      expect(firstResult.result.data.items.length).toBe(2);
      expect(firstResult.result.data.nextCursor).toBeDefined();

      // Second page using cursor
      const secondResponse = await makeTRPCRequest(
        "listHistory",
        {
          limit: 2,
          cursor: firstResult.result.data.nextCursor,
        },
        "GET",
      );
      const secondResult = await secondResponse.json();
      expect(secondResult.result.data.items.length).toBeGreaterThan(0);
    });

    it("should only return history for authenticated user", async () => {
      const otherUserId = await seedTestUser(db);
      await seedTestHistoryItem(db, otherUserId);
      await seedTestHistoryItem(db, testUserId);

      const response = await makeTRPCRequest("listHistory", {}, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.items.length).toBe(1);
      expect(result.result.data.items[0].userId).toBe(testUserId);
    });
  });

  describe("getHistoryById", () => {
    it("should get history item by ID", async () => {
      const historyId = await seedTestHistoryItem(db, testUserId, {
        content: {
          url: "https://example.com",
          title: "Example",
        },
      });

      const response = await makeTRPCRequest(
        "getHistoryById",
        { id: historyId },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeDefined();
      expect(result.result.data.id).toBe(historyId);
      expect(result.result.data.userId).toBe(testUserId);
    });

    it("should return null for non-existent ID", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const response = await makeTRPCRequest(
        "getHistoryById",
        { id: fakeId },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeNull();
    });

    it("should not return history from another user", async () => {
      const otherUserId = await seedTestUser(db);
      const otherHistoryId = await seedTestHistoryItem(db, otherUserId);

      const response = await makeTRPCRequest(
        "getHistoryById",
        { id: otherHistoryId },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeNull();
    });
  });

  describe("deleteHistory", () => {
    it("should delete a history item", async () => {
      const historyId = await seedTestHistoryItem(db, testUserId);

      const response = await makeTRPCRequest("deleteHistory", { id: historyId });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.success).toBe(true);

      // Verify it was deleted
      const [deletedItem] = await db
        .select()
        .from(history)
        .where(eq(history.id, historyId));
      expect(deletedItem).toBeUndefined();
    });

    it("should not delete history from another user", async () => {
      const otherUserId = await seedTestUser(db);
      const otherHistoryId = await seedTestHistoryItem(db, otherUserId);

      const response = await makeTRPCRequest("deleteHistory", {
        id: otherHistoryId,
      });
      expect(response.status).toBe(200);

      // Verify it still exists
      const [item] = await db
        .select()
        .from(history)
        .where(eq(history.id, otherHistoryId));
      expect(item).toBeDefined();
    });
  });

  describe("clearAllHistory", () => {
    it("should clear all history for user", async () => {
      await seedTestHistoryItems(db, testUserId, 5);

      const response = await makeTRPCRequest("clearAllHistory");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.success).toBe(true);

      // Verify all history was deleted
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId));
      expect(items.length).toBe(0);
    });

    it("should not clear history from other users", async () => {
      const otherUserId = await seedTestUser(db);
      await seedTestHistoryItem(db, otherUserId);
      await seedTestHistoryItems(db, testUserId, 3);

      const response = await makeTRPCRequest("clearAllHistory");
      expect(response.status).toBe(200);

      // Verify other user's history still exists
      const otherItems = await db
        .select()
        .from(history)
        .where(eq(history.userId, otherUserId));
      expect(otherItems.length).toBe(1);
    });
  });

  describe("getHistoryStats", () => {
    it("should return total count and counts by type", async () => {
      await seedTestHistoryItem(db, testUserId, { type: "page" });
      await seedTestHistoryItem(db, testUserId, { type: "page" });
      await seedTestHistoryItem(db, testUserId, { type: "video" });

      const response = await makeTRPCRequest("getHistoryStats", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.totalCount).toBe(3);
      expect(result.result.data.byType).toBeDefined();
      expect(Array.isArray(result.result.data.byType)).toBe(true);
      
      const pageType = result.result.data.byType.find((t: any) => t.type === "page");
      expect(pageType).toBeDefined();
      expect(Number(pageType.count)).toBe(2);
      
      const videoType = result.result.data.byType.find((t: any) => t.type === "video");
      expect(videoType).toBeDefined();
      expect(Number(videoType.count)).toBe(1);
    });

    it("should return zero counts for empty history", async () => {
      const response = await makeTRPCRequest("getHistoryStats", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.totalCount).toBe(0);
      expect(result.result.data.byType).toEqual([]);
    });
  });

  describe("getHistoryTypes", () => {
    it("should return distinct history types", async () => {
      await seedTestHistoryItem(db, testUserId, { type: "page" });
      await seedTestHistoryItem(db, testUserId, { type: "video" });
      await seedTestHistoryItem(db, testUserId, { type: "page" });

      const response = await makeTRPCRequest("getHistoryTypes", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result.result.data)).toBe(true);
      expect(result.result.data).toContain("page");
      expect(result.result.data).toContain("video");
    });

    it("should return empty array for no history", async () => {
      const response = await makeTRPCRequest("getHistoryTypes", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toEqual([]);
    });
  });

  describe("getHistoryByDateRange", () => {
    it("should return history counts by date in range", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await seedTestHistoryItem(db, testUserId, {
        timelineTime: today.toISOString(),
      });
      await seedTestHistoryItem(db, testUserId, {
        timelineTime: today.toISOString(),
      });
      await seedTestHistoryItem(db, testUserId, {
        timelineTime: yesterday.toISOString(),
      });

      const startDate = yesterday.toISOString();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      const response = await makeTRPCRequest(
        "getHistoryByDateRange",
        {
          startDate,
          endDate: endDate.toISOString(),
        },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result.result.data)).toBe(true);
      expect(result.result.data.length).toBeGreaterThan(0);
      expect(result.result.data[0]).toHaveProperty("date");
      expect(result.result.data[0]).toHaveProperty("count");
    });
  });

  describe("getRecentVisits", () => {
    it("should return recent visits with limit", async () => {
      await seedTestHistoryItems(db, testUserId, 5);

      const response = await makeTRPCRequest(
        "getRecentVisits",
        { limit: 3 },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result.result.data)).toBe(true);
      expect(result.result.data.length).toBe(3);
      expect(result.result.data[0]).toHaveProperty("id");
      expect(result.result.data[0]).toHaveProperty("url");
      expect(result.result.data[0]).toHaveProperty("title");
      expect(result.result.data[0]).toHaveProperty("domain");
      expect(result.result.data[0]).toHaveProperty("visitTime");
    });

    it("should respect limit parameter", async () => {
      await seedTestHistoryItems(db, testUserId, 10);

      const response = await makeTRPCRequest(
        "getRecentVisits",
        { limit: 5 },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.length).toBe(5);
    });
  });

  describe("getExtensionStats", () => {
    it("should return total synced count", async () => {
      await seedTestHistoryItems(db, testUserId, 5);

      const response = await makeTRPCRequest("getExtensionStats", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.totalSynced).toBe(5);
    });

    it("should return zero for empty history", async () => {
      const response = await makeTRPCRequest("getExtensionStats", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.totalSynced).toBe(0);
    });
  });

  describe("getHistoryByDate", () => {
    it("should return history items for specific date", async () => {
      const targetDate = new Date("2024-01-15T12:00:00Z");
      const otherDate = new Date("2024-01-16T12:00:00Z");

      await seedTestHistoryItem(db, testUserId, {
        timelineTime: targetDate.toISOString(),
      });
      await seedTestHistoryItem(db, testUserId, {
        timelineTime: targetDate.toISOString(),
      });
      await seedTestHistoryItem(db, testUserId, {
        timelineTime: otherDate.toISOString(),
      });

      const response = await makeTRPCRequest(
        "getHistoryByDate",
        { date: "2024-01-15" },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result.result.data)).toBe(true);
      expect(result.result.data.length).toBe(2);
    });
  });

  describe("getHistoryItemsByDateRange", () => {
    it("should return history items in date range", async () => {
      const startDate = new Date("2024-01-15T00:00:00Z");
      const endDate = new Date("2024-01-17T00:00:00Z");

      await seedTestHistoryItem(db, testUserId, {
        timelineTime: new Date("2024-01-15T12:00:00Z").toISOString(),
      });
      await seedTestHistoryItem(db, testUserId, {
        timelineTime: new Date("2024-01-16T12:00:00Z").toISOString(),
      });
      await seedTestHistoryItem(db, testUserId, {
        timelineTime: new Date("2024-01-18T12:00:00Z").toISOString(), // Outside range
      });

      const response = await makeTRPCRequest(
        "getHistoryItemsByDateRange",
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        "GET",
      );
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result.result.data)).toBe(true);
      expect(result.result.data.length).toBe(2);
    });
  });

  describe("Full History Lifecycle", () => {
    it("should complete full lifecycle: create, list, get, delete", async () => {
      // 1. Create history item
      const createResponse = await makeTRPCRequest("createHistory", {
        timelineTime: new Date().toISOString(),
        type: "page",
        contentId: "lifecycle-content",
        content: {
          url: "https://example.com",
          title: "Lifecycle Test",
          domain: "example.com",
        },
      });
      expect(createResponse.status).toBe(200);
      const createResult = await createResponse.json();
      const createdId = createResult.result.data.id;

      // 2. List history (should include the new item)
      const listResponse = await makeTRPCRequest("listHistory", {}, "GET");
      expect(listResponse.status).toBe(200);
      const listResult = await listResponse.json();
      expect(listResult.result.data.items.length).toBe(1);
      expect(listResult.result.data.items[0].id).toBe(createdId);

      // 3. Get by ID
      const getResponse = await makeTRPCRequest(
        "getHistoryById",
        { id: createdId },
        "GET",
      );
      expect(getResponse.status).toBe(200);
      const getResult = await getResponse.json();
      expect(getResult.result.data.id).toBe(createdId);

      // 4. Delete
      const deleteResponse = await makeTRPCRequest("deleteHistory", {
        id: createdId,
      });
      expect(deleteResponse.status).toBe(200);

      // 5. Verify it's gone
      const finalListResponse = await makeTRPCRequest("listHistory", {}, "GET");
      expect(finalListResponse.status).toBe(200);
      const finalListResult = await finalListResponse.json();
      expect(finalListResult.result.data.items.length).toBe(0);
    });
  });
});
