import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow(),
});

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

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "string" }).notNull(),
});

export const history = pgTable(
  "history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt", { mode: "string" })
      .notNull()
      .defaultNow(),
    timelineTime: timestamp("timelineTime", { mode: "string" }).notNull(),
    type: text("type").notNull(),
    contentId: text("contentId").notNull(),
    content: jsonb("content").notNull(),
    searchContent: text("searchContent"),
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
  ],
);

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
