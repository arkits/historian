import { router, publicProcedure, protectedProcedure } from "./trpc";
import { auth } from "./auth";
import { db } from "@/lib/db";
import { history, apiKey } from "@/lib/schema";
import { eq, desc, and, or, lt, count, type SQL, gte, sql } from "drizzle-orm";
import { z } from "zod";

function generateApiKey(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const appRouter = router({
  getSession: publicProcedure.query(async ({ ctx }) => {
    const headers: Record<string, string> = {};
    ctx.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const session = await auth.api.getSession({
      headers,
    });
    return session;
  }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    const result = await auth.api.signOut({
      headers: ctx.headers,
    });
    return result;
  }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),

  listHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z
          .object({
            id: z.string(),
            timelineTime: z.string().datetime(),
          })
          .optional(),
        type: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, type } = input;
      const userId = ctx.session.user.id;

      let condition: SQL = eq(history.userId, userId);
      if (type) {
        condition = and(condition, eq(history.type, type)) as SQL;
      }
      if (cursor) {
        // Match the ORDER BY (timelineTime desc, id desc):
        // fetch rows "after" cursor using:
        // timelineTime < cursor.timelineTime OR
        // (timelineTime = cursor.timelineTime AND id < cursor.id)
        condition = and(
          condition,
          or(
            lt(history.timelineTime, cursor.timelineTime),
            and(
              eq(history.timelineTime, cursor.timelineTime),
              lt(history.id, cursor.id),
            ),
          ),
        ) as SQL;
      }

      const items = await db
        .select()
        .from(history)
        .where(condition)
        .orderBy(desc(history.timelineTime), desc(history.id))
        .limit(limit + 1);

      let nextCursor: { id: string; timelineTime: string } | undefined;
      if (items.length > limit) {
        const nextItem = items[limit - 1];
        if (nextItem) {
          const timelineTime = new Date(nextItem.timelineTime).toISOString();
          nextCursor = {
            id: nextItem.id,
            timelineTime,
          };
          items.pop();
        }
      }

      return { items, nextCursor };
    }),

  createHistory: protectedProcedure
    .input(
      z.object({
        timelineTime: z.string().datetime(),
        type: z.string(),
        contentId: z.string(),
        content: z.record(z.string(), z.unknown()),
        searchContent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [result] = await db
        .insert(history)
        .values({
          userId,
          timelineTime: input.timelineTime,
          type: input.type,
          contentId: input.contentId,
          content: input.content as any,
          searchContent: input.searchContent,
        })
        .returning();
      return result;
    }),

  importHistory: protectedProcedure
    .input(
      z.array(
        z.object({
          timelineTime: z.string().datetime(),
          type: z.string(),
          contentId: z.string(),
          content: z.record(z.string(), z.unknown()),
          searchContent: z.string().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (input.length === 0) {
        return { imported: 0 };
      }
      const values = input.map((item) => ({
        userId,
        timelineTime: item.timelineTime,
        type: item.type,
        contentId: item.contentId,
        content: item.content as any,
        searchContent: item.searchContent,
      }));
      await db.insert(history).values(values).returning();
      return { imported: values.length };
    }),

  getHistoryById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [item] = await db
        .select()
        .from(history)
        .where(
          and(eq(history.id, input.id), eq(history.userId, userId)) as SQL,
        )
        .limit(1);
      return item ?? null;
    }),

  deleteHistory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .delete(history)
        .where(
          and(eq(history.id, input.id), eq(history.userId, userId)) as SQL,
        );
      return { success: true };
    }),

  clearAllHistory: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await db.delete(history).where(eq(history.userId, userId));
    return { success: true };
  }),

  getHistoryStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await db
      .select({ count: count(history.id) })
      .from(history)
      .where(eq(history.userId, userId));
    const totalCount = Number(result[0]?.count ?? 0);

    const types = await db
      .select({ type: history.type, count: count(history.id) })
      .from(history)
      .where(eq(history.userId, userId))
      .groupBy(history.type);

    return { totalCount, byType: types };
  }),

  getHistoryTypes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const types = await db
      .selectDistinct({ type: history.type })
      .from(history)
      .where(eq(history.userId, userId))
      .orderBy(history.type);

    return types.map((t) => t.type).filter(Boolean) as string[];
  }),

  getHistoryByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result = await db
        .select({
          date: sql<string>`DATE(${history.timelineTime})`,
          count: count(history.id),
        })
        .from(history)
        .where(
          and(
            eq(history.userId, userId),
            gte(history.timelineTime, input.startDate),
            lt(history.timelineTime, input.endDate),
          ),
        )
        .groupBy(sql`DATE(${history.timelineTime})`)
        .orderBy(sql`DATE(${history.timelineTime})`);

      return result.map((r) => ({
        date: r.date,
        count: Number(r.count),
      }));
    }),

  getRecentVisits: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit } = input;

      const items = await db
        .select({
          id: history.id,
          url: sql<string>`${history.content}->>'url'`,
          title: sql<string>`${history.content}->>'title'`,
          domain: sql<string>`${history.content}->>'domain'`,
          visitTime: history.timelineTime,
        })
        .from(history)
        .where(eq(history.userId, userId))
        .orderBy(desc(history.timelineTime))
        .limit(limit);

      return items.map((item) => ({
        id: item.id,
        url: item.url ?? "",
        title: item.title ?? "",
        domain: item.domain ?? "",
        visitTime: item.visitTime
          ? new Date(item.visitTime).toISOString()
          : new Date().toISOString(),
      }));
    }),

  getExtensionStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await db
      .select({ count: count(history.id) })
      .from(history)
      .where(eq(history.userId, userId));
    const totalCount = Number(result[0]?.count ?? 0);
    return { totalSynced: totalCount };
  }),

  getHistoryByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const startDate = new Date(input.date).toISOString();
      const endDate = new Date(input.date);
      endDate.setDate(endDate.getDate() + 1);

      const items = await db
        .select()
        .from(history)
        .where(
          and(
            eq(history.userId, userId),
            gte(history.timelineTime, startDate),
            lt(history.timelineTime, endDate.toISOString()),
          ),
        )
        .orderBy(desc(history.timelineTime));

      return items;
    }),

  getHistoryItemsByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const start = new Date(input.startDate).toISOString();
      const end = new Date(input.endDate);
      end.setDate(end.getDate() + 1);

      const items = await db
        .select()
        .from(history)
        .where(
          and(
            eq(history.userId, userId),
            gte(history.timelineTime, start),
            lt(history.timelineTime, end.toISOString()),
          ),
        )
        .orderBy(desc(history.timelineTime));

      return items;
    }),

  listApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
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
    return keys;
  }),

  createApiKey: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const key = generateApiKey();
      const [result] = await db
        .insert(apiKey)
        .values({
          key,
          name: input.name,
          userId,
        })
        .returning();
      return result;
    }),

  deleteApiKey: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .delete(apiKey)
        .where(and(eq(apiKey.id, input.id), eq(apiKey.userId, userId)));
      return { success: true };
    }),

  toggleApiKey: protectedProcedure
    .input(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .update(apiKey)
        .set({ isActive: input.isActive })
        .where(and(eq(apiKey.id, input.id), eq(apiKey.userId, userId)));
      return { success: true };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headers: Record<string, string> = {};
      ctx.headers.forEach((value, key) => {
        headers[key] = value;
      });
      await auth.api.changePassword({
        headers,
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
      });
      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
