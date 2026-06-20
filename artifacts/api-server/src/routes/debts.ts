import { Router } from "express";
import { db, debtsTable } from "@workspace/db";
import { eq, ilike, asc, desc, sql, isNull, isNotNull } from "drizzle-orm";
import {
  ListDebtsQueryParams,
  CreateDebtBody,
  GetDebtParams,
  UpdateDebtParams,
  UpdateDebtBody,
  DeleteDebtParams,
  SettleDebtParams,
  UnsettleDebtParams,
} from "@workspace/api-zod";

const router = Router();

function serializeDebt(row: typeof debtsTable.$inferSelect) {
  return {
    ...row,
    amount: Number(row.amount),
    settledAt: row.settledAt ? row.settledAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/debts", async (req, res) => {
  const parsed = ListDebtsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { search, sortOrder, settled } = parsed.data;

  const order = sortOrder === "desc" ? desc(debtsTable.date) : asc(debtsTable.date);

  const conditions = [];
  if (search) conditions.push(ilike(debtsTable.personName, `%${search}%`));
  if (settled === "yes") conditions.push(isNotNull(debtsTable.settledAt));
  if (settled === "no") conditions.push(isNull(debtsTable.settledAt));

  const rows = await db
    .select()
    .from(debtsTable)
    .where(conditions.length > 0 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : undefined)
    .orderBy(order);

  res.json(rows.map(serializeDebt));
});

router.post("/debts", async (req, res) => {
  const parsed = CreateDebtBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { personName, amount, date, mobileNumber, notes } = parsed.data;

  const [row] = await db
    .insert(debtsTable)
    .values({
      personName,
      amount: String(amount),
      date,
      mobileNumber: mobileNumber ?? null,
      notes: notes ?? null,
    })
    .returning();

  res.status(201).json(serializeDebt(row));
});

router.get("/debts/summary", async (req, res) => {
  const [summary] = await db
    .select({
      totalAmount: sql<number>`coalesce(sum(${debtsTable.amount}), 0)`,
      totalCount: sql<number>`count(*)::int`,
      settledCount: sql<number>`count(*) filter (where ${debtsTable.settledAt} is not null)::int`,
      outstandingAmount: sql<number>`coalesce(sum(${debtsTable.amount}) filter (where ${debtsTable.settledAt} is null), 0)`,
      outstandingCount: sql<number>`count(*) filter (where ${debtsTable.settledAt} is null)::int`,
    })
    .from(debtsTable);

  res.json({
    totalAmount: Number(summary.totalAmount),
    totalCount: Number(summary.totalCount),
    settledCount: Number(summary.settledCount),
    outstandingAmount: Number(summary.outstandingAmount),
    outstandingCount: Number(summary.outstandingCount),
  });
});

router.get("/debts/:id", async (req, res) => {
  const parsed = GetDebtParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(debtsTable)
    .where(eq(debtsTable.id, parsed.data.id));

  if (!row) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  res.json(serializeDebt(row));
});

router.patch("/debts/:id", async (req, res) => {
  const paramsParsed = UpdateDebtParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateDebtBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updates: Record<string, unknown> = {};
  const body = bodyParsed.data;
  if (body.personName !== undefined) updates.personName = body.personName;
  if (body.amount !== undefined) updates.amount = String(body.amount);
  if (body.date !== undefined) updates.date = body.date;
  if (body.mobileNumber !== undefined) updates.mobileNumber = body.mobileNumber;
  if (body.notes !== undefined) updates.notes = body.notes;

  const [row] = await db
    .update(debtsTable)
    .set(updates)
    .where(eq(debtsTable.id, paramsParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  res.json(serializeDebt(row));
});

router.delete("/debts/:id", async (req, res) => {
  const parsed = DeleteDebtParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(debtsTable)
    .where(eq(debtsTable.id, parsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  res.status(204).send();
});

router.post("/debts/:id/settle", async (req, res) => {
  const parsed = SettleDebtParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .update(debtsTable)
    .set({ settledAt: new Date() })
    .where(eq(debtsTable.id, parsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  res.json(serializeDebt(row));
});

router.post("/debts/:id/unsettle", async (req, res) => {
  const parsed = UnsettleDebtParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .update(debtsTable)
    .set({ settledAt: null })
    .where(eq(debtsTable.id, parsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  res.json(serializeDebt(row));
});

export default router;
