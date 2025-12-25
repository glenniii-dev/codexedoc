import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/* ================================================================
   USERS
   ================================================================ */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  securityQuestionOne: text("security_question_one").notNull(),
  securityAnswerOne: text("security_answer_one").notNull(),
  securityQuestionTwo: text("security_question_two").notNull(),
  securityAnswerTwo: text("security_answer_two").notNull(),
  securityCode: text("security_code").notNull(),
  image: text("image").notNull().default(""),
  bio: text("bio").notNull().default(""),
  badges: text("badges").array().default(sql`'{}'::text[]`),
});

export const userCodex = pgTable("user_codex", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  pages: uuid("pages").array().notNull().default(sql`'{}'::uuid[]`),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

/* ================================================================
   MESSAGES
   ================================================================ */

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull().default(""),
  image: text("image"),
  timestamp: timestamp("timestamp", { mode: "string" }).defaultNow().notNull(),
});

/* ================================================================
   THREADS
   ================================================================ */

export const threads = pgTable("threads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  messageIds: uuid("message_ids").array().notNull().default(sql`'{}'::uuid[]`),
});

/* ================================================================
   DOMAINS
   ================================================================ */

export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  threadIds: uuid("thread_ids").array().notNull().default(sql`'{}'::uuid[]`),
});

/* ================================================================
   BRAINSTORMS
   ================================================================ */

export const brainstorms = pgTable("brainstorms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userIds: uuid("user_ids").array().notNull().default(sql`'{}'::uuid[]`),
  messageIds: uuid("message_ids").array().notNull().default(sql`'{}'::uuid[]`),
});

/* ================================================================
   PAGES
   ================================================================ */

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp", { mode: "string" }).defaultNow().notNull(),
});

/* ================================================================
   CIRCLES
   ================================================================ */

export const circles = pgTable("circles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  image: text("image").notNull().default(""),
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  domainIds: uuid("domain_ids").array().notNull().default(sql`'{}'::uuid[]`),
  threadIds: uuid("thread_ids").array().notNull().default(sql`'{}'::uuid[]`),
  brainstormIds: uuid("brainstorm_ids").array().notNull().default(sql`'{}'::uuid[]`),
  circleCodexId: uuid("circle_codex_id"),
});

/* ================================================================
   CIRCLE MEMBERS
   ================================================================ */

export const circleMembers = pgTable("circle_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: uuid("circle_id")
    .notNull()
    .references(() => circles.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // "owner" | "admin" | "member"
});

/* ================================================================
   CIRCLE CODEX
   ================================================================ */

export const circleCodex = pgTable("circle_codex", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: uuid("circle_id")
    .notNull()
    .references(() => circles.id, { onDelete: "cascade" }),
  pages: uuid("pages").array().notNull().default(sql`'{}'::uuid[]`),
});

/* ================================================================
   RELATIONS
   ================================================================ */

export const usersRelations = relations(users, ({ many, one }) => ({
  messages: many(messages),
  circleMembers: many(circleMembers),
  ownedCircles: many(circles),
  personalCodex: one(userCodex, {
    fields: [users.id],
    references: [userCodex.userId],
  }),
}));

export const userCodexRelations = relations(userCodex, ({ one }) => ({
  user: one(users, {
    fields: [userCodex.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const circlesRelations = relations(circles, ({ one, many }) => ({
  owner: one(users, {
    fields: [circles.ownerId],
    references: [users.id],
  }),
  members: many(circleMembers),
  circleCodex: one(circleCodex, {
    fields: [circles.circleCodexId],
    references: [circleCodex.id],
  }),
}));

export const circleMembersRelations = relations(circleMembers, ({ one }) => ({
  circle: one(circles, {
    fields: [circleMembers.circleId],
    references: [circles.id],
  }),
  user: one(users, {
    fields: [circleMembers.userId],
    references: [users.id],
  }),
}));

export const circleCodexRelations = relations(circleCodex, ({ one }) => ({
  circle: one(circles, {
    fields: [circleCodex.circleId],
    references: [circles.id],
  }),
}));