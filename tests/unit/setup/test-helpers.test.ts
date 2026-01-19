import { describe, it, expect } from "vitest";
import { createTestApiKey, createTestSession } from "../../setup/test-helpers";

function createFakeDb() {
  const inserted: any[] = [];

  const db = {
    insert: () => ({
      values: (v: any) => ({
        returning: async () => {
          inserted.push(v);
          return [v];
        },
      }),
    }),
    __getInserted: () => inserted,
  };

  return db;
}

describe("tests/setup/test-helpers.ts", () => {
  it("createTestApiKey should include userId and prefix", () => {
    const key = createTestApiKey("user_123");
    expect(key).toContain("hist_test_user_123_");
  });

  it("createTestSession should insert a user and session and return token", async () => {
    const db = createFakeDb();

    const result = await createTestSession(db as any);

    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.session.token).toBe(result.token);
    expect(result.session.userId).toBe(result.user.id);

    const inserted = (db as any).__getInserted();
    expect(inserted.length).toBe(2);
    expect(inserted[0].email).toContain("@example.com");
    expect(inserted[1].expiresAt).toBeDefined();
  });
});

