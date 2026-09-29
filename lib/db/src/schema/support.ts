import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const supportCustomers = pgTable("support_customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  avatar: text("avatar").notNull(),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  frustrationLevel: integer("frustration_level").notNull().default(0),
  lastSeenAt: text("last_seen_at").notNull(),
  openTickets: integer("open_tickets").notNull().default(0),
  tags: text("tags").array().notNull().default([]),
  environment: jsonb("environment").$type<{
    browser: string;
    operatingSystem: string;
    device: string;
    version: string;
  }>().notNull(),
  knownIssues: text("known_issues").array().notNull().default([]),
  preferredTone: text("preferred_tone").notNull(),
});

export const supportMemories = pgTable("support_memories", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  confidence: real("confidence").notNull().default(0.85),
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportTimelineEvents = pgTable("support_timeline_events", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull(),
  occurredAt: text("occurred_at").notNull(),
  sentiment: text("sentiment").notNull(),
  solutionWorked: boolean("solution_worked").notNull().default(false),
});

export const supportChatMessages = pgTable("support_chat_messages", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSupportCustomerSchema = createInsertSchema(supportCustomers);
export const insertSupportMemorySchema = createInsertSchema(supportMemories);
export const insertSupportTimelineEventSchema = createInsertSchema(supportTimelineEvents);
export const insertSupportChatMessageSchema = createInsertSchema(supportChatMessages);

export type SupportCustomer = typeof supportCustomers.$inferSelect;
export type SupportMemory = typeof supportMemories.$inferSelect;
export type SupportTimelineEvent = typeof supportTimelineEvents.$inferSelect;
export type SupportChatMessage = typeof supportChatMessages.$inferSelect;

export const supportStatusSchema = z.enum(["open", "waiting", "resolved"]);