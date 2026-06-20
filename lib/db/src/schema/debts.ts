import { pgTable, serial, text, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const debtsTable = pgTable("debts", {
  id: serial("id").primaryKey(),
  personName: text("person_name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  mobileNumber: text("mobile_number"),
  notes: text("notes"),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDebtSchema = createInsertSchema(debtsTable).omit({ id: true, createdAt: true });
export const updateDebtSchema = createUpdateSchema(debtsTable).omit({ id: true, createdAt: true });

export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type UpdateDebt = z.infer<typeof updateDebtSchema>;
export type Debt = typeof debtsTable.$inferSelect;
