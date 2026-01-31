/// <reference types="vitest/globals" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { apiKey, history } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { handleExtensionRequest } from "@/server/extension";
import {
  seedTestUser,
  seedTestApiKey,
  seedTestHistoryItem,
  cleanupAllTestData,
  closeTestPool,
} from "../setup/test-db";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian2";

describe("Extension Integration Tests", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let testUserId1: string;
  let testUserId2: string;
  let testApiKey1: string;
  let testApiKey2: string;
  let inactiveApiKey: string;

  beforeAll(async () => {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
    db = drizzle(pool);
  });

  beforeEach(async () => {
    // Clean up test data
    await cleanupAllTestData(db);

    // Create two test users
    testUserId1 = await seedTestUser(db);
    testUserId2 = await seedTestUser(db, {
      email: `test2_${Date.now()}@example.com`,
      name: "Test User 2",
    });

    // Create API keys for both users
    const key1 = await seedTestApiKey(db, testUserId1, "User 1 API Key");
    testApiKey1 = key1.key;

    const key2 = await seedTestApiKey(db, testUserId2, "User 2 API Key");
    testApiKey2 = key2.key;

    // Create an inactive API key for user 1
    const inactiveKey = await seedTestApiKey(db, testUserId1, "Inactive Key");
    inactiveApiKey = inactiveKey.key;
    // Deactivate it
    await db
      .update(apiKey)
      .set({ isActive: false })
      .where(eq(apiKey.key, inactiveApiKey));
  });

  afterAll(async () => {
    await cleanupAllTestData(db);
    await closeTestPool();
    await pool.end();
  });

  describe("Extension Import Endpoint - Authentication", () => {
    it("should reject requests without API key", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should reject requests with invalid API key", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": "invalid-key-that-does-not-exist",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should reject requests with inactive API key", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": inactiveApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should accept requests with valid active API key", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(0);
    });

    it("should update lastUsedAt when API key is used", async () => {
      // Get initial state
      const [keyBefore] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.key, testApiKey1));

      expect(keyBefore?.lastUsedAt).toBeNull();

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      await handleExtensionRequest(request);

      // Check that lastUsedAt was updated
      const [keyAfter] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.key, testApiKey1));

      expect(keyAfter?.lastUsedAt).not.toBeNull();
      expect(new Date(keyAfter!.lastUsedAt!).getTime()).toBeGreaterThan(
        Date.now() - 5000,
      );
    });
  });

  describe("Extension Import Endpoint - Import Functionality", () => {
    it("should return 0 imported for empty items array", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(0);

      // Verify no history was created
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(items).toHaveLength(0);
    });

    it("should import single history item", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_123",
              timelineTime,
              type: "page",
              contentId: "content-1",
              content: {
                url: "https://example.com",
                title: "Example Page",
                domain: "example.com",
              },
            },
          ],
        }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(1);

      // Verify history was created in database
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(items).toHaveLength(1);
      expect(items[0]?.type).toBe("page");
      expect(items[0]?.contentId).toBe("content-1");
      expect(items[0]?.content).toEqual({
        url: "https://example.com",
        title: "Example Page",
        domain: "example.com",
      });
    });

    it("should import multiple history items in single request", async () => {
      const timelineTime1 = new Date().toISOString();
      const timelineTime2 = new Date(Date.now() - 1000).toISOString();
      const timelineTime3 = new Date(Date.now() - 2000).toISOString();

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_1",
              timelineTime: timelineTime1,
              type: "page",
              contentId: "content-1",
              content: {
                url: "https://example.com/page1",
                title: "Page 1",
                domain: "example.com",
              },
            },
            {
              id: "ext_2",
              timelineTime: timelineTime2,
              type: "video",
              contentId: "content-2",
              content: {
                url: "https://example.com/video",
                title: "Video Page",
                domain: "example.com",
              },
            },
            {
              id: "ext_3",
              timelineTime: timelineTime3,
              type: "page",
              contentId: "content-3",
              content: {
                url: "https://example.com/page3",
                title: "Page 3",
                domain: "example.com",
              },
            },
          ],
        }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(3);

      // Verify all history items were created
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(items).toHaveLength(3);

      // Verify items are correctly stored
      const types = items.map((item) => item.type);
      expect(types).toContain("page");
      expect(types).toContain("video");
    });

    it("should import items with searchContent field", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_123",
              timelineTime,
              type: "page",
              contentId: "content-1",
              content: {
                url: "https://example.com",
                title: "Example",
                domain: "example.com",
              },
              searchContent: "example search content",
            },
          ],
        }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(items).toHaveLength(1);
      expect(items[0]?.searchContent).toBe("example search content");
    });

    it("should import items without searchContent field", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_123",
              timelineTime,
              type: "page",
              contentId: "content-1",
              content: {
                url: "https://example.com",
                title: "Example",
                domain: "example.com",
              },
            },
          ],
        }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(items).toHaveLength(1);
      expect(items[0]?.searchContent).toBeNull();
    });

    it("should handle complex content objects", async () => {
      const timelineTime = new Date().toISOString();
      const complexContent = {
        url: "https://example.com",
        title: "Example",
        domain: "example.com",
        metadata: {
          author: "John Doe",
          tags: ["tech", "programming"],
          nested: {
            deep: "value",
          },
        },
        array: [1, 2, 3],
      };

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_123",
              timelineTime,
              type: "page",
              contentId: "content-1",
              content: complexContent,
            },
          ],
        }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(items).toHaveLength(1);
      expect(items[0]?.content).toEqual(complexContent);
    });
  });

  describe("Extension Import Endpoint - User Isolation", () => {
    it("should import items only for the user associated with the API key", async () => {
      const timelineTime = new Date().toISOString();

      // Import with user 1's API key
      const request1 = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_user1",
              timelineTime,
              type: "page",
              contentId: "content-user1",
              content: {
                url: "https://user1.example.com",
                title: "User 1 Page",
                domain: "user1.example.com",
              },
            },
          ],
        }),
      });

      const response1 = await handleExtensionRequest(request1);
      expect(response1.status).toBe(200);

      // Import with user 2's API key
      const request2 = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey2,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_user2",
              timelineTime,
              type: "page",
              contentId: "content-user2",
              content: {
                url: "https://user2.example.com",
                title: "User 2 Page",
                domain: "user2.example.com",
              },
            },
          ],
        }),
      });

      const response2 = await handleExtensionRequest(request2);
      expect(response2.status).toBe(200);

      // Verify user 1's items
      const user1Items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(user1Items).toHaveLength(1);
      expect(user1Items[0]?.contentId).toBe("content-user1");

      // Verify user 2's items
      const user2Items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId2));
      expect(user2Items).toHaveLength(1);
      expect(user2Items[0]?.contentId).toBe("content-user2");

      // Verify isolation - user 1 should not see user 2's items
      expect(user1Items[0]?.contentId).not.toBe("content-user2");
      expect(user2Items[0]?.contentId).not.toBe("content-user1");
    });

    it("should maintain user isolation when importing multiple batches", async () => {
      // User 1 imports first batch
      const request1 = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_1_1",
              timelineTime: new Date().toISOString(),
              type: "page",
              contentId: "batch1-item1",
              content: { url: "https://user1.com/1", title: "User1-1", domain: "user1.com" },
            },
            {
              id: "ext_1_2",
              timelineTime: new Date(Date.now() - 1000).toISOString(),
              type: "page",
              contentId: "batch1-item2",
              content: { url: "https://user1.com/2", title: "User1-2", domain: "user1.com" },
            },
          ],
        }),
      });

      await handleExtensionRequest(request1);

      // User 2 imports batch
      const request2 = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey2,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_2_1",
              timelineTime: new Date().toISOString(),
              type: "page",
              contentId: "batch2-item1",
              content: { url: "https://user2.com/1", title: "User2-1", domain: "user2.com" },
            },
          ],
        }),
      });

      await handleExtensionRequest(request2);

      // User 1 imports second batch
      const request3 = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_1_3",
              timelineTime: new Date(Date.now() - 2000).toISOString(),
              type: "page",
              contentId: "batch3-item1",
              content: { url: "https://user1.com/3", title: "User1-3", domain: "user1.com" },
            },
          ],
        }),
      });

      await handleExtensionRequest(request3);

      // Verify final state
      const user1Items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(user1Items).toHaveLength(3);

      const user2Items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId2));
      expect(user2Items).toHaveLength(1);
    });
  });

  describe("Extension Import Endpoint - Error Handling", () => {
    it("should return 500 for invalid JSON", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: "invalid json {",
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe("Import failed");
    });

    it("should return 200 with 0 imported for missing items field", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(0);
    });

    it("should return 404 for non-POST requests", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "GET",
        headers: {
          "X-API-Key": testApiKey1,
        },
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Not found");
    });

    it("should return 404 for non-import paths", async () => {
      const request = new Request("http://localhost:3000/api/extension/other", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Not found");
    });
  });

  describe("Extension Import Endpoint - Integration with Existing Data", () => {
    it("should import items alongside existing history", async () => {
      // Create some existing history for user 1
      await seedTestHistoryItem(db, testUserId1, {
        type: "page",
        contentId: "existing-1",
        content: {
          url: "https://existing.com",
          title: "Existing Page",
          domain: "existing.com",
        },
      });

      // Import new items via extension
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey1,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: "ext_new",
              timelineTime: new Date().toISOString(),
              type: "page",
              contentId: "extension-1",
              content: {
                url: "https://extension.com",
                title: "Extension Page",
                domain: "extension.com",
              },
            },
          ],
        }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      // Verify both existing and new items exist
      const allItems = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId1));
      expect(allItems).toHaveLength(2);

      const contentIds = allItems.map((item) => item.contentId);
      expect(contentIds).toContain("existing-1");
      expect(contentIds).toContain("extension-1");
    });
  });
});
