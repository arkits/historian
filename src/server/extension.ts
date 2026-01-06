import { db } from "@/lib/db";
import { apiKey, history } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface VisitData {
  id: string;
  url: string;
  title: string;
  visitTime: string;
  referrer: string;
  domain: string;
  metadata?: {
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  content?: string;
  visitDuration?: number;
  localTimestamp?: number;
}

interface HistoryItem {
  id: string;
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

function generateApiKey(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function generateContentId(url: string, visitTime: string): string {
  const data = `${url}|${visitTime}`;
  const hash = simpleHash(data);
  return `page_${hash}`;
}

function extractSearchQuery(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;

    const searchTerms = ["q", "query", "s", "search", "keyword", "ks"];
    for (const term of searchTerms) {
      const value = searchParams.get(term);
      if (value && value.length > 1) {
        return value;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function handleExtensionRequest(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "POST" && path === "/api/extension/import") {
    return handleImport(request);
  }

  if (request.method === "POST" && path === "/api/extension/create-key") {
    return handleCreateKey(request);
  }

  if (request.method === "GET" && path === "/api/extension/keys") {
    return handleListKeys(request);
  }

  if (request.method === "DELETE" && path.startsWith("/api/extension/keys/")) {
    const keyId = path.split("/").pop();
    if (keyId) {
      return handleDeleteKey(request, keyId);
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

async function authenticateRequest(request: Request): Promise<string | null> {
  const apiKeyHeader = request.headers.get("X-API-Key");

  if (!apiKeyHeader) {
    return null;
  }

  const result = await db
    .select({ userId: apiKey.userId, isActive: apiKey.isActive })
    .from(apiKey)
    .where(and(eq(apiKey.key, apiKeyHeader), eq(apiKey.isActive, true)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  await db
    .update(apiKey)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiKey.key, apiKeyHeader));

  return result[0]!.userId;
}

async function handleImport(request: Request): Promise<Response> {
  const userId = await authenticateRequest(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const items: HistoryItem[] = body.items || [];

    if (items.length === 0) {
      return new Response(JSON.stringify({ imported: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const values = items.map((item) => ({
      userId,
      timelineTime: item.timelineTime,
      type: item.type,
      contentId: item.contentId,
      content: item.content,
      searchContent: item.searchContent,
    }));

    await db.insert(history).values(values);

    return new Response(
      JSON.stringify({
        imported: items.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(JSON.stringify({ error: "Import failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleCreateKey(request: Request): Promise<Response> {
  const userId = await authenticateRequest(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const name = body.name || "Chrome Extension";
    const key = generateApiKey();

    const [apiKeyRecord] = await db
      .insert(apiKey)
      .values({
        key,
        name,
        userId,
      })
      .returning();

    if (!apiKeyRecord) {
      throw new Error("Failed to create API key");
    }

    return new Response(
      JSON.stringify({
        id: apiKeyRecord.id,
        key: apiKeyRecord.key,
        name: apiKeyRecord.name,
        createdAt: apiKeyRecord.createdAt,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Create key error:", error);
    return new Response(JSON.stringify({ error: "Failed to create key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleListKeys(request: Request): Promise<Response> {
  const userId = await authenticateRequest(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const keys = await db
      .select({
        id: apiKey.id,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
        isActive: apiKey.isActive,
      })
      .from(apiKey)
      .where(eq(apiKey.userId, userId));

    return new Response(JSON.stringify(keys), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("List keys error:", error);
    return new Response(JSON.stringify({ error: "Failed to list keys" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleDeleteKey(
  request: Request,
  keyId: string,
): Promise<Response> {
  const userId = await authenticateRequest(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await db
      .delete(apiKey)
      .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, userId)));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete key error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
