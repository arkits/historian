/// <reference types="vitest/globals" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  user,
  session,
  account,
  verification,
  history,
  apiKey,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { handleExtensionRequest } from "@/server/extension";
import { auth } from "@/server/auth";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian2";

function randomId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

describe("Extension Tests", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let testUser: { id: string; email: string; name: string };
  let testApiKey: string;

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
    const signUpResult = (await auth.api.signUpEmail({
      body: { name: "Test User", email, password },
    })) as any;

    testUser = {
      id: signUpResult.user.id,
      email: signUpResult.user.email,
      name: signUpResult.user.name,
    };

    // Create a test API key
    const [insertedKey] = await db
      .insert(apiKey)
      .values({
        userId: testUser.id,
        key: `test-key-${randomId()}`,
        name: "Test API Key",
        isActive: true,
      })
      .returning();

    testApiKey = insertedKey!.key;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("handleExtensionRequest", () => {
    it("should return 404 for non-POST requests", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "GET",
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Not found");
    });

    it("should return 404 for non-import paths", async () => {
      const request = new Request("http://localhost:3000/api/extension/other", {
        method: "POST",
        headers: {
          "X-API-Key": testApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Not found");
    });

    it("should handle POST /api/extension/import correctly", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(0);
    });
  });

  describe("handleImport - Authentication", () => {
    it("should return 401 for missing API key", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should return 401 for invalid API key", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": "invalid-key",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should return 401 for inactive API key", async () => {
      // Create an inactive API key
      const [inactiveKey] = await db
        .insert(apiKey)
        .values({
          userId: testUser.id,
          key: `inactive-key-${randomId()}`,
          name: "Inactive Key",
          isActive: false,
        })
        .returning();

      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": inactiveKey!.key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should authenticate with valid API key", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);
    });

    it("should update lastUsedAt when authenticating", async () => {
      // Get initial lastUsedAt
      const [keyBefore] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.key, testApiKey));

      expect(keyBefore?.lastUsedAt).toBeNull();

      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      await handleExtensionRequest(request);

      // Check that lastUsedAt was updated
      const [keyAfter] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.key, testApiKey));

      expect(keyAfter?.lastUsedAt).not.toBeNull();
      expect(new Date(keyAfter!.lastUsedAt!).getTime()).toBeGreaterThan(
        Date.now() - 5000,
      );
    });
  });

  describe("handleImport - Import Logic", () => {
    it("should return 0 imported for empty items array", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: [] }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(0);

      // Verify no history was created
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(0);
    });

    it("should import single history item", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                timelineTime,
                type: "page",
                contentId: "content-1",
                content: { url: "https://example.com", title: "Example" },
              },
            ],
          }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(1);

      // Verify history was created
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(1);
      expect(items[0]?.type).toBe("page");
      expect(items[0]?.contentId).toBe("content-1");
      expect(items[0]?.content).toEqual({
        url: "https://example.com",
        title: "Example",
      });
    });

    it("should import multiple history items", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                timelineTime,
                type: "page",
                contentId: "content-1",
                content: { url: "https://example.com", title: "Example 1" },
              },
              {
                timelineTime: new Date(Date.now() - 1000).toISOString(),
                type: "video",
                contentId: "content-2",
                content: {
                  url: "https://example.com/video",
                  title: "Example Video",
                },
              },
              {
                timelineTime: new Date(Date.now() - 2000).toISOString(),
                type: "page",
                contentId: "content-3",
                content: {
                  url: "https://example.com/page3",
                  title: "Example 3",
                },
              },
            ],
          }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(3);

      // Verify all history items were created
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(3);
    });

    it("should correctly map all fields from items", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                timelineTime,
                type: "page",
                contentId: "content-1",
                content: { url: "https://example.com", title: "Example" },
                searchContent: "example search content",
              },
            ],
          }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      // Verify all fields were mapped correctly
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(1);
      expect(items[0]?.userId).toBe(testUser.id);
      // Compare dates instead of exact strings due to database format differences
      expect(new Date(items[0]!.timelineTime).toISOString()).toBe(
        new Date(timelineTime).toISOString(),
      );
      expect(items[0]?.type).toBe("page");
      expect(items[0]?.contentId).toBe("content-1");
      expect(items[0]?.content).toEqual({
        url: "https://example.com",
        title: "Example",
      });
      expect(items[0]?.searchContent).toBe("example search content");
    });

    it("should handle items without searchContent", async () => {
      const timelineTime = new Date().toISOString();
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                timelineTime,
                type: "page",
                contentId: "content-1",
                content: { url: "https://example.com" },
              },
            ],
          }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(1);
      expect(items[0]?.searchContent).toBeNull();
    });

    it("should only import items for authenticated user", async () => {
      // Create another user with their own API key
      const email2 = `test_${randomId()}@example.com`;
      const signUpResult2 = (await auth.api.signUpEmail({
        body: {
          name: "Test User 2",
          email: email2,
          password: "testpassword123",
        },
      })) as any;

      const [otherUserKey] = await db
        .insert(apiKey)
        .values({
          userId: signUpResult2.user.id,
          key: `other-key-${randomId()}`,
          name: "Other User Key",
          isActive: true,
        })
        .returning();

      const timelineTime = new Date().toISOString();
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": otherUserKey!.key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                timelineTime,
                type: "page",
                contentId: "content-1",
                content: { url: "https://example.com" },
              },
            ],
          }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      // Verify items were created for the correct user
      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, signUpResult2.user.id));
      expect(items).toHaveLength(1);

      // Verify no items were created for the first user
      const firstUserItems = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(firstUserItems).toHaveLength(0);
    });

    it("should return 500 for invalid JSON", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: "invalid json",
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe("Import failed");
    });

    it("should return 200 with 0 imported for missing items field", async () => {
      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.imported).toBe(0);
    });

    it("should handle complex content objects", async () => {
      const timelineTime = new Date().toISOString();
      const complexContent = {
        url: "https://example.com",
        title: "Example",
        metadata: {
          author: "John Doe",
          tags: ["tech", "programming"],
          nested: {
            deep: "value",
          },
        },
        array: [1, 2, 3],
      };

      const request = new Request(
        "http://localhost:3000/api/extension/import",
        {
          method: "POST",
          headers: {
            "X-API-Key": testApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                timelineTime,
                type: "page",
                contentId: "content-1",
                content: complexContent,
              },
            ],
          }),
        },
      );

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const items = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUser.id));
      expect(items).toHaveLength(1);
      expect(items[0]?.content).toEqual(complexContent);
    });
  });
});
