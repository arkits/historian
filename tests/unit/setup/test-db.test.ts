/// <reference types="vitest/globals" />
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  createTestPool,
  getTestDb,
  runMigrations,
  seedTestUser,
  seedTestSession,
  seedTestApiKey,
  seedTestHistoryItem,
  seedTestHistoryItems,
  cleanupUserData,
  cleanupAllTestData,
  closeTestPool,
  user,
  session,
  apiKey,
  history,
} from "../../setup/test-db";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian2";

describe("tests/setup/test-db.ts", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    // Set TEST_DATABASE_URL environment variable for test-db.ts functions
    process.env.TEST_DATABASE_URL = TEST_DATABASE_URL;
    
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
    db = drizzle(pool);
    // Run migrations to ensure schema is set up
    await runMigrations();
  });

  beforeEach(async () => {
    // Clean up all test data before each test
    await cleanupAllTestData(db);
  });

  afterAll(async () => {
    await cleanupAllTestData(db);
    await closeTestPool();
    await pool.end();
  });

  describe("createTestPool", () => {
    it("should create a new pool when called first time", async () => {
      const pool1 = await createTestPool();
      expect(pool1).toBeInstanceOf(Pool);
    });

    it("should return the same pool instance on subsequent calls", async () => {
      const pool1 = await createTestPool();
      const pool2 = await createTestPool();
      expect(pool1).toBe(pool2);
    });
  });

  describe("getTestDb", () => {
    it("should return a drizzle database instance", async () => {
      const testDb = await getTestDb();
      expect(testDb).toBeDefined();
      expect(typeof testDb.insert).toBe("function");
      expect(typeof testDb.select).toBe("function");
      expect(typeof testDb.delete).toBe("function");
    });
  });

  describe("runMigrations", () => {
    it("should run migrations without error", async () => {
      await expect(runMigrations()).resolves.not.toThrow();
    });
  });

  describe("seedTestUser", () => {
    it("should create a test user with default values", async () => {
      const userId = await seedTestUser(db);

      expect(userId).toBeDefined();
      expect(userId).toContain("test_user_");

      const [createdUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));

      expect(createdUser).toBeDefined();
      expect(createdUser.name).toBe("Test User");
      expect(createdUser.email).toContain("@example.com");
      expect(createdUser.emailVerified).toBe(false);
      expect(createdUser.image).toBeNull();
    });

    it("should create a test user with custom overrides", async () => {
      const customEmail = `custom_${Date.now()}@example.com`;
      const userId = await seedTestUser(db, {
        name: "Custom User",
        email: customEmail,
        emailVerified: true,
      });

      const [createdUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));

      expect(createdUser.name).toBe("Custom User");
      expect(createdUser.email).toBe(customEmail);
      expect(createdUser.emailVerified).toBe(true);
    });

    it("should generate unique user IDs", async () => {
      const userId1 = await seedTestUser(db);
      const userId2 = await seedTestUser(db);

      expect(userId1).not.toBe(userId2);
    });
  });

  describe("seedTestSession", () => {
    it("should create a test session for a user", async () => {
      const userId = await seedTestUser(db);
      const result = await seedTestSession(db, userId);

      expect(result.sessionId).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.userId).toBe(userId);

      const [createdSession] = await db
        .select()
        .from(session)
        .where(eq(session.id, result.sessionId));

      expect(createdSession).toBeDefined();
      expect(createdSession.userId).toBe(userId);
      expect(createdSession.token).toBe(result.token);
      expect(createdSession.ipAddress).toBe("127.0.0.1");
      expect(createdSession.userAgent).toBe("test-agent");
    });

    it("should create sessions with future expiration dates", async () => {
      const userId = await seedTestUser(db);
      const result = await seedTestSession(db, userId);

      const [createdSession] = await db
        .select()
        .from(session)
        .where(eq(session.id, result.sessionId));

      const expiresAt = new Date(createdSession.expiresAt);
      const now = new Date();
      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe("seedTestApiKey", () => {
    it("should create a test API key with default name", async () => {
      const userId = await seedTestUser(db);
      const result = await seedTestApiKey(db, userId);

      expect(result.key).toBeDefined();
      expect(result.key).toContain("hist_test_");
      expect(result.name).toBe("Test API Key");
      expect(result.userId).toBe(userId);
      expect(result.isActive).toBe(true);
      expect(result.lastUsedAt).toBeNull();
      expect(result.expiresAt).toBeNull();
    });

    it("should create a test API key with custom name", async () => {
      const userId = await seedTestUser(db);
      const result = await seedTestApiKey(db, userId, "Custom API Key");

      expect(result.name).toBe("Custom API Key");
    });

    it("should generate unique API keys", async () => {
      const userId = await seedTestUser(db);
      const key1 = await seedTestApiKey(db, userId);
      const key2 = await seedTestApiKey(db, userId);

      expect(key1.key).not.toBe(key2.key);
    });
  });

  describe("seedTestHistoryItem", () => {
    it("should create a test history item with default values", async () => {
      const userId = await seedTestUser(db);
      const historyId = await seedTestHistoryItem(db, userId);

      expect(historyId).toBeDefined();

      const [createdHistory] = await db
        .select()
        .from(history)
        .where(eq(history.id, historyId));

      expect(createdHistory).toBeDefined();
      expect(createdHistory.userId).toBe(userId);
      expect(createdHistory.type).toBe("page");
      expect(createdHistory.content).toEqual({
        url: "https://example.com",
        title: "Test Page",
        domain: "example.com",
      });
      expect(createdHistory.searchContent).toBe("test page example");
    });

    it("should create a test history item with custom overrides", async () => {
      const userId = await seedTestUser(db);
      const customContent = {
        url: "https://custom.com",
        title: "Custom Page",
        domain: "custom.com",
      };

      const historyId = await seedTestHistoryItem(db, userId, {
        type: "download",
        content: customContent,
        searchContent: "custom search",
      });

      const [createdHistory] = await db
        .select()
        .from(history)
        .where(eq(history.id, historyId));

      expect(createdHistory.type).toBe("download");
      expect(createdHistory.content).toEqual(customContent);
      expect(createdHistory.searchContent).toBe("custom search");
    });
  });

  describe("seedTestHistoryItems", () => {
    it("should create multiple history items", async () => {
      const userId = await seedTestUser(db);
      const ids = await seedTestHistoryItems(db, userId, 5);

      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(5); // All IDs should be unique

      const allHistory = await db
        .select()
        .from(history)
        .where(eq(history.userId, userId));

      expect(allHistory).toHaveLength(5);
    });

    it("should create history items with different timestamps", async () => {
      const userId = await seedTestUser(db);
      await seedTestHistoryItems(db, userId, 3);

      const allHistory = await db
        .select()
        .from(history)
        .where(eq(history.userId, userId))
        .orderBy(history.timelineTime);

      expect(allHistory.length).toBe(3);
      // Timestamps should be in descending order (newest first)
      const timestamps = allHistory.map((h) => new Date(h.timelineTime).getTime());
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });

    it("should create history items with unique URLs", async () => {
      const userId = await seedTestUser(db);
      await seedTestHistoryItems(db, userId, 3);

      const allHistory = await db
        .select()
        .from(history)
        .where(eq(history.userId, userId));

      const urls = allHistory.map((h) => (h.content as any).url);
      expect(new Set(urls).size).toBe(3); // All URLs should be unique
    });
  });

  describe("cleanupUserData", () => {
    it("should delete all data for a specific user", async () => {
      const userId1 = await seedTestUser(db);
      const userId2 = await seedTestUser(db);

      // Create data for both users
      await seedTestSession(db, userId1);
      await seedTestSession(db, userId2);
      await seedTestApiKey(db, userId1);
      await seedTestApiKey(db, userId2);
      await seedTestHistoryItem(db, userId1);
      await seedTestHistoryItem(db, userId2);

      // Clean up user1's data
      await cleanupUserData(db, userId1);

      // User1's data should be gone
      const user1History = await db
        .select()
        .from(history)
        .where(eq(history.userId, userId1));
      expect(user1History).toHaveLength(0);

      const user1Sessions = await db
        .select()
        .from(session)
        .where(eq(session.userId, userId1));
      expect(user1Sessions).toHaveLength(0);

      const user1ApiKeys = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.userId, userId1));
      expect(user1ApiKeys).toHaveLength(0);

      // User2's data should still exist
      const user2History = await db
        .select()
        .from(history)
        .where(eq(history.userId, userId2));
      expect(user2History).toHaveLength(1);

      const user2Sessions = await db
        .select()
        .from(session)
        .where(eq(session.userId, userId2));
      expect(user2Sessions).toHaveLength(1);
    });

    it("should delete the user itself", async () => {
      const userId = await seedTestUser(db);
      await cleanupUserData(db, userId);

      const [deletedUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));

      expect(deletedUser).toBeUndefined();
    });
  });

  describe("cleanupAllTestData", () => {
    it("should delete all test data from all tables", async () => {
      const userId1 = await seedTestUser(db);
      const userId2 = await seedTestUser(db);

      await seedTestSession(db, userId1);
      await seedTestApiKey(db, userId1);
      await seedTestHistoryItem(db, userId1);
      await seedTestHistoryItem(db, userId2);

      await cleanupAllTestData(db);

      const allUsers = await db.select().from(user);
      const allSessions = await db.select().from(session);
      const allApiKeys = await db.select().from(apiKey);
      const allHistory = await db.select().from(history);

      expect(allUsers).toHaveLength(0);
      expect(allSessions).toHaveLength(0);
      expect(allApiKeys).toHaveLength(0);
      expect(allHistory).toHaveLength(0);
    });
  });

  describe("closeTestPool", () => {
    it("should close the test pool", async () => {
      await createTestPool();
      await closeTestPool();

      // After closing, creating a new pool should create a new instance
      const newPool = await createTestPool();
      expect(newPool).toBeDefined();
    });
  });
});
