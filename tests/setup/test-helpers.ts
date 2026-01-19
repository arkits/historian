import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { user, session, apiKey, history } from "../../src/lib/schema";
import { eq } from "drizzle-orm";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/historian_test";

let sharedPool: Pool | null = null;

function getPool(): Pool {
  if (!sharedPool) {
    sharedPool = new PgPool({
      connectionString: TEST_DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return sharedPool;
}

export function getDb() {
  return drizzle(getPool());
}

export function createTestUser(overrides?: Partial<typeof user.$inferInsert>) {
  const id = `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const email = `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}@example.com`;

  return {
    id,
    name: overrides?.name || "Test User",
    email: overrides?.email || email,
    emailVerified: false,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestSessionData(userId: string) {
  const id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  return {
    id,
    userId,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
  };
}

export function createTestApiKeyData(userId: string, name = "Test Key") {
  const key = `hist_test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  return {
    key,
    name,
    userId,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    expiresAt: null,
    isActive: true,
  };
}

export function createTestHistoryData(userId: string, index = 0) {
  const id = `hist_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 15)}`;

  return {
    id,
    userId,
    timelineTime: new Date(Date.now() - index * 1000 * 60).toISOString(),
    type: "page",
    contentId: `content_${Date.now()}_${index}`,
    content: {
      url: `https://example${index}.com`,
      title: `Test Page ${index}`,
      domain: `example${index}.com`,
    },
    searchContent: `test page ${index}`,
    createdAt: new Date().toISOString(),
  };
}

export async function insertTestUser(
  db: ReturnType<typeof drizzle>,
  userData: ReturnType<typeof createTestUser>,
) {
  const [result] = await db.insert(user).values(userData).returning();
  return result;
}

export async function insertTestSession(
  db: ReturnType<typeof drizzle>,
  sessionData: ReturnType<typeof createTestSessionData>,
) {
  const [result] = await db.insert(session).values(sessionData).returning();
  return result;
}

export async function insertTestApiKey(
  db: ReturnType<typeof drizzle>,
  keyData: ReturnType<typeof createTestApiKeyData>,
) {
  const [result] = await db.insert(apiKey).values(keyData).returning();
  return result;
}

export async function insertTestHistory(
  db: ReturnType<typeof drizzle>,
  historyData: ReturnType<typeof createTestHistoryData>,
) {
  const [result] = await db.insert(history).values(historyData).returning();
  return result;
}

export async function createUserWithSession(db: ReturnType<typeof drizzle>) {
  const userData = createTestUser();
  const dbUser = await insertTestUser(db, userData);
  const sessionData = createTestSessionData(dbUser.id);
  const dbSession = await insertTestSession(db, sessionData);

  return {
    user: dbUser,
    session: dbSession,
    token: sessionData.token,
  };
}

export async function createUserWithApiKey(
  db: ReturnType<typeof drizzle>,
  name = "Test API Key",
) {
  const userData = createTestUser();
  const dbUser = await insertTestUser(db, userData);
  const keyData = createTestApiKeyData(dbUser.id, name);
  const dbKey = await insertTestApiKey(db, keyData);

  return {
    user: dbUser,
    apiKey: dbKey,
    rawKey: keyData.key,
  };
}

export async function createUserWithHistory(
  db: ReturnType<typeof drizzle>,
  historyCount = 5,
) {
  const userData = createTestUser();
  const dbUser = await insertTestUser(db, userData);

  const historyIds: string[] = [];
  for (let i = 0; i < historyCount; i++) {
    const historyData = createTestHistoryData(dbUser.id, i);
    const dbHistory = await insertTestHistory(db, historyData);
    historyIds.push(dbHistory.id);
  }

  return {
    user: dbUser,
    historyIds,
  };
}

export async function deleteTestUser(
  db: ReturnType<typeof drizzle>,
  userId: string,
) {
  await db.delete(history).where(eq(history.userId, userId));
  await db.delete(apiKey).where(eq(apiKey.userId, userId));
  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(user).where(eq(user.id, userId));
}

export async function cleanupDatabase(db: ReturnType<typeof drizzle>) {
  await db.delete(history).execute();
  await db.delete(apiKey).execute();
  await db.delete(session).execute();
  await db.delete(user).execute();
}

export async function closePool() {
  if (sharedPool) {
    await sharedPool.end();
    sharedPool = null;
  }
}
