import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { relations, sql, type SQL } from "drizzle-orm";

const tsvector = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "tsvector";
  },
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  history: many(history),
  apiKeys: many(apiKey),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "string" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
});

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: "string" }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "string" }),
  password: text("password"),
  scope: text("scope"),
  idToken: text("idToken"),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow(),
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "string" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow(),
});

export const history = pgTable(
  "history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt", { mode: "string", withTimezone: true })
      .notNull()
      .defaultNow(),
    timelineTime: timestamp("timelineTime", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    type: text("type").notNull(),
    contentId: text("contentId").notNull(),
    content: jsonb("content").notNull(),
    searchContent: text("searchContent"),
    searchVector: tsvector("searchVector").generatedAlwaysAs(
      (): SQL =>
        sql`to_tsvector('english', coalesce("searchContent", '') || ' ' || coalesce("content"->>'title', '') || ' ' || coalesce("content"->>'url', '') || ' ' || coalesce("content"->>'description', ''))`,
    ),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    {
      historyHash: uniqueIndex("History_hash").on(
        table.contentId,
        table.userId,
        table.type,
        table.timelineTime,
      ),
    },
    {
      searchIdx: index("history_search_idx").using("gin", table.searchVector),
    },
  ],
);

export const historyRelations = relations(history, ({ one }) => ({
  user: one(user, {
    fields: [history.userId],
    references: [user.id],
  }),
}));

export const apiKey = pgTable("api_key", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  lastUsedAt: timestamp("lastUsedAt", { mode: "string" }),
  expiresAt: timestamp("expiresAt", { mode: "string" }),
  isActive: boolean("isActive").default(true).notNull(),
});

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  user: one(user, {
    fields: [apiKey.userId],
    references: [user.id],
  }),
}));
