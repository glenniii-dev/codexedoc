import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey().notNull(),
  name: text().notNull(),
  username: text().notNull().unique(),
  password: text().notNull(),
  securityQuestionOne: text().notNull(),
  securityAnswerOne: text().notNull(),
  securityQuestionTwo: text().notNull(),
  securityAnswerTwo: text().notNull(),
  securityCode: text().notNull(),
});