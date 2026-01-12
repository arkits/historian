import { db } from "@/lib/db";
import { apiKey, history } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface HistoryItem {
  id: string;
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent?: string;
}

export async function handleExtensionRequest(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "POST" && path === "/api/extension/import") {
    return handleImport(request);
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

  console.log("[Import] userId:", userId);
  console.log(
    "[Import] API Key:",
    request.headers.get("X-API-Key")?.slice(0, 10) + "...",
  );

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const items: HistoryItem[] = body.items || [];
    console.log("[Import] items count:", items.length);

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

