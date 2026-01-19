/// <reference types="vitest/globals" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user, session, account, verification, apiKey, history } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { createTRPCHandler } from "@/server/handler";
import { handleExtensionRequest } from "@/server/extension";
import {
  seedTestUser,
  seedTestApiKey,
  cleanupAllTestData,
  closeTestPool,
} from "../setup/test-db";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian2";

describe("API Keys Integration Tests", () => {
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

    // Session is created and cookies are set
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
    if (method === "GET" && input) {
      Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
        url.searchParams.set(key, JSON.stringify(value));
      });
    }

    const requestInit: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: testCookies,
        Origin: "http://localhost:3000",
      },
    };

    if (method === "POST" && input) {
      requestInit.body = JSON.stringify(input);
    }

    const request = new Request(url.toString(), requestInit);

    return trpcHandler(request);
  }

  describe("listApiKeys", () => {
    it("should list API keys for authenticated user", async () => {
      // Create some API keys
      await seedTestApiKey(db, testUserId, "Key 1");
      await seedTestApiKey(db, testUserId, "Key 2");

      const response = await makeTRPCRequest("listApiKeys", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeDefined();
      expect(Array.isArray(result.result.data)).toBe(true);
      expect(result.result.data.length).toBe(2);
      expect(result.result.data[0]).toHaveProperty("name");
      expect(result.result.data[0]).toHaveProperty("id");
      expect(result.result.data[0]).toHaveProperty("createdAt");
      expect(result.result.data[0]).toHaveProperty("isActive");
      // Should not include the key itself
      expect(result.result.data[0]).not.toHaveProperty("key");
    });

    it("should return empty array when user has no API keys", async () => {
      const response = await makeTRPCRequest("listApiKeys", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toEqual([]);
    });

    it("should only return API keys for the authenticated user", async () => {
      // Create another user with API keys
      const otherUserId = await seedTestUser(db);
      await seedTestApiKey(db, otherUserId, "Other User Key");

      // Create API key for test user
      await seedTestApiKey(db, testUserId, "My Key");

      const response = await makeTRPCRequest("listApiKeys", undefined, "GET");
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.length).toBe(1);
      expect(result.result.data[0].name).toBe("My Key");
    });
  });

  describe("createApiKey", () => {
    it("should create a new API key", async () => {
      const response = await makeTRPCRequest("createApiKey", { name: "My API Key" });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data).toBeDefined();
      expect(result.result.data.name).toBe("My API Key");
      expect(result.result.data.userId).toBe(testUserId);
      expect(result.result.data.key).toBeDefined();
      expect(typeof result.result.data.key).toBe("string");
      expect(result.result.data.key.length).toBeGreaterThan(0);
      expect(result.result.data.isActive).toBe(true);
    });

    it("should reject empty name", async () => {
      const response = await makeTRPCRequest("createApiKey", { name: "" });
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Too small");
    });

    it("should reject name longer than 100 characters", async () => {
      const longName = "a".repeat(101);
      const response = await makeTRPCRequest("createApiKey", { name: longName });
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Too big");
    });

    it("should create multiple API keys with different names", async () => {
      const response1 = await makeTRPCRequest("createApiKey", { name: "Key 1" });
      const response2 = await makeTRPCRequest("createApiKey", { name: "Key 2" });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const result1 = await response1.json();
      const result2 = await response2.json();

      expect(result1.result.data.name).toBe("Key 1");
      expect(result2.result.data.name).toBe("Key 2");
      expect(result1.result.data.key).not.toBe(result2.result.data.key);
    });
  });

  describe("deleteApiKey", () => {
    it("should delete an API key", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "To Delete");

      const response = await makeTRPCRequest("deleteApiKey", { id: apiKeyData.id });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.success).toBe(true);

      // Verify it was deleted
      const keys = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, apiKeyData.id));
      expect(keys).toHaveLength(0);
    });

    it("should not delete API key from another user", async () => {
      const otherUserId = await seedTestUser(db);
      const otherUserKey = await seedTestApiKey(db, otherUserId, "Other User Key");

      const response = await makeTRPCRequest("deleteApiKey", { id: otherUserKey.id });
      expect(response.status).toBe(200);

      // Verify it still exists
      const keys = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, otherUserKey.id));
      expect(keys).toHaveLength(1);
    });

    it("should return success even if key doesn't exist", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const response = await makeTRPCRequest("deleteApiKey", { id: fakeId });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.success).toBe(true);
    });
  });

  describe("toggleApiKey", () => {
    it("should toggle API key to inactive", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "To Toggle");

      const response = await makeTRPCRequest("toggleApiKey", {
        id: apiKeyData.id,
        isActive: false,
      });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.success).toBe(true);

      // Verify it was updated
      const [key] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, apiKeyData.id));
      expect(key?.isActive).toBe(false);
    });

    it("should toggle API key to active", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "To Activate");
      // Set to inactive first
      await db
        .update(apiKey)
        .set({ isActive: false })
        .where(eq(apiKey.id, apiKeyData.id));

      const response = await makeTRPCRequest("toggleApiKey", {
        id: apiKeyData.id,
        isActive: true,
      });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.result.data.success).toBe(true);

      // Verify it was updated
      const [key] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, apiKeyData.id));
      expect(key?.isActive).toBe(true);
    });

    it("should not toggle API key from another user", async () => {
      const otherUserId = await seedTestUser(db);
      const otherUserKey = await seedTestApiKey(db, otherUserId, "Other User Key");

      const response = await makeTRPCRequest("toggleApiKey", {
        id: otherUserKey.id,
        isActive: false,
      });
      expect(response.status).toBe(200);

      // Verify it wasn't changed
      const [key] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, otherUserKey.id));
      expect(key?.isActive).toBe(true);
    });
  });

  describe("Extension API Key Authentication", () => {
    it("should authenticate request with valid API key", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "Extension Key");

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKeyData.key,
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.imported).toBe(0);
    });

    it("should reject request without API key", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.error).toBe("Unauthorized");
    });

    it("should reject request with invalid API key", async () => {
      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "invalid-key",
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.error).toBe("Unauthorized");
    });

    it("should reject request with inactive API key", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "Inactive Key");
      // Set to inactive
      await db
        .update(apiKey)
        .set({ isActive: false })
        .where(eq(apiKey.id, apiKeyData.id));

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKeyData.key,
        },
        body: JSON.stringify({ items: [] }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.error).toBe("Unauthorized");
    });

    it("should update lastUsedAt when API key is used", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "Tracking Key");
      expect(apiKeyData.lastUsedAt).toBeNull();

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKeyData.key,
        },
        body: JSON.stringify({ items: [] }),
      });

      await handleExtensionRequest(request);

      // Check that lastUsedAt was updated
      const [updatedKey] = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.id, apiKeyData.id));
      expect(updatedKey?.lastUsedAt).not.toBeNull();
      expect(updatedKey?.lastUsedAt).toBeDefined();
    });

    it("should import history items with valid API key", async () => {
      const apiKeyData = await seedTestApiKey(db, testUserId, "Import Key");

      const historyItems = [
        {
          id: "item1",
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content1",
          content: {
            url: "https://example.com",
            title: "Example Page",
            domain: "example.com",
          },
          searchContent: "example page",
        },
        {
          id: "item2",
          timelineTime: new Date().toISOString(),
          type: "page",
          contentId: "content2",
          content: {
            url: "https://test.com",
            title: "Test Page",
            domain: "test.com",
          },
          searchContent: "test page",
        },
      ];

      const request = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKeyData.key,
        },
        body: JSON.stringify({ items: historyItems }),
      });

      const response = await handleExtensionRequest(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.imported).toBe(2);

      // Verify items were imported
      const importedItems = await db
        .select()
        .from(history)
        .where(eq(history.userId, testUserId));
      expect(importedItems.length).toBe(2);
    });
  });

  describe("Full API Key Lifecycle", () => {
    it("should complete full lifecycle: create, list, toggle, use, delete", async () => {
      // 1. Create API key
      const createResponse = await makeTRPCRequest("createApiKey", { name: "Lifecycle Key" });
      expect(createResponse.status).toBe(200);
      const createResult = await createResponse.json();
      const createdKey = createResult.result.data;
      expect(createdKey.name).toBe("Lifecycle Key");
      expect(createdKey.isActive).toBe(true);

      // 2. List API keys (should include the new one)
      const listResponse = await makeTRPCRequest("listApiKeys", undefined, "GET");
      expect(listResponse.status).toBe(200);
      const listResult = await listResponse.json();
      expect(listResult.result.data.length).toBe(1);
      expect(listResult.result.data[0].name).toBe("Lifecycle Key");

      // 3. Use the API key for extension import
      const importRequest = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": createdKey.key,
        },
        body: JSON.stringify({
          items: [
            {
              id: "lifecycle-item",
              timelineTime: new Date().toISOString(),
              type: "page",
              contentId: "content1",
              content: { url: "https://example.com", title: "Example", domain: "example.com" },
            },
          ],
        }),
      });
      const importResponse = await handleExtensionRequest(importRequest);
      expect(importResponse.status).toBe(200);

      // 4. Toggle to inactive
      const toggleResponse = await makeTRPCRequest("toggleApiKey", {
        id: createdKey.id,
        isActive: false,
      });
      expect(toggleResponse.status).toBe(200);

      // 5. Verify inactive key doesn't work
      const failedImportRequest = new Request("http://localhost:3000/api/extension/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": createdKey.key,
        },
        body: JSON.stringify({ items: [] }),
      });
      const failedResponse = await handleExtensionRequest(failedImportRequest);
      expect(failedResponse.status).toBe(401);

      // 6. Delete the API key
      const deleteResponse = await makeTRPCRequest("deleteApiKey", { id: createdKey.id });
      expect(deleteResponse.status).toBe(200);

      // 7. Verify it's gone from list
      const finalListResponse = await makeTRPCRequest("listApiKeys", undefined, "GET");
      expect(finalListResponse.status).toBe(200);
      const finalListResult = await finalListResponse.json();
      expect(finalListResult.result.data.length).toBe(0);
    });
  });
});
