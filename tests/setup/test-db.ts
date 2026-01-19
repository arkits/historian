import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  user,
  session,
  account,
  verification,
  apiKey,
  history,
} from "@/lib/schema";

function getTestDatabaseUrl(): string {
  return (
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/historian_test"
  );
}

let testPool: Pool | null = null;

export async function createTestPool(): Promise<Pool> {
  if (testPool) {
    return testPool;
  }

  testPool = new Pool({
    connectionString: getTestDatabaseUrl(),
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return testPool;
}

export async function getTestDb() {
  const pool = await createTestPool();
  return drizzle(pool);
}

export async function runMigrations() {
  const pool = await createTestPool();
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle" });
}

export async function seedTestUser(
  db: ReturnType<typeof drizzle>,
  overrides?: Partial<typeof user.$inferInsert>,
) {
  const randomSuffix = randomUUID().replace(/-/g, "").substring(0, 8);
  const testUserId = `test_user_${Date.now()}_${randomSuffix}`;

  await db.insert(user).values({
    id: testUserId,
    name: overrides?.name || "Test User",
    email: overrides?.email || `test_${Date.now()}_${randomSuffix}@example.com`,
    emailVerified: false,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  return testUserId;
}

export async function seedTestSession(
  db: ReturnType<typeof drizzle>,
  userId: string,
) {
  const sessionId = `test_session_${Date.now()}_${randomUUID().replace(/-/g, "").substring(0, 8)}`;
  const token = `test_token_${Date.now()}_${randomUUID().replace(/-/g, "").substring(0, 8)}`;

  await db.insert(session).values({
    id: sessionId,
    userId,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
  });

  return { sessionId, token, userId };
}

export async function seedTestApiKey(
  db: ReturnType<typeof drizzle>,
  userId: string,
  name = "Test API Key",
) {
  const key = `hist_test_${Date.now()}_${randomUUID().replace(/-/g, "").substring(0, 8)}`;

  const [result] = await db
    .insert(apiKey)
    .values({
      key,
      name,
      userId,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt: null,
      isActive: true,
    })
    .returning();

  return { ...result, key };
}

export async function seedTestHistoryItem(
  db: ReturnType<typeof drizzle>,
  userId: string,
  overrides?: Partial<typeof history.$inferInsert>,
) {
  const [result] = await db.insert(history).values({
    userId,
    timelineTime: new Date().toISOString(),
    type: "page",
    contentId: `content_${Date.now()}`,
    content: {
      url: "https://example.com",
      title: "Test Page",
      domain: "example.com",
    },
    searchContent: "test page example",
    createdAt: new Date().toISOString(),
    ...overrides,
  }).returning();

  return result.id;
}

export async function seedTestHistoryItems(
  db: ReturnType<typeof drizzle>,
  userId: string,
  count: number,
) {
  const ids: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = await seedTestHistoryItem(db, userId, {
      timelineTime: new Date(Date.now() - i * 1000 * 60).toISOString(),
      content: {
        url: `https://example${i}.com`,
        title: `Test Page ${i}`,
        domain: `example${i}.com`,
      },
      searchContent: `test page ${i}`,
    });
    ids.push(id);
  }

  return ids;
}

export async function cleanupUserData(
  db: ReturnType<typeof drizzle>,
  userId: string,
) {
  await db.delete(history).where(eq(history.userId, userId));
  await db.delete(apiKey).where(eq(apiKey.userId, userId));
  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(account).where(eq(account.userId, userId));
  await db.delete(user).where(eq(user.id, userId));
}

export async function cleanupAllTestData(db: ReturnType<typeof drizzle>) {
  await db.delete(history).execute();
  await db.delete(apiKey).execute();
  await db.delete(session).execute();
  await db.delete(account).execute();
  await db.delete(verification).execute();
  await db.delete(user).execute();
}

export async function closeTestPool() {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

export { user, session, account, verification, apiKey, history };
