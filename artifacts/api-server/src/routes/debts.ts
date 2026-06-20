import { Router } from "express";
import { db, debtsTable } from "@workspace/db";
import { eq, ilike, asc, desc, sql } from "drizzle-orm";
import {
  ListDebtsQueryParams,
  CreateDebtBody,
  GetDebtParams,
  UpdateDebtParams,
  UpdateDebtBody,
  DeleteDebtParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/debts", async (req, res) => {
  const parsed = ListDebtsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { search, sortOrder } = parsed.data;

  const order = sortOrder === "desc" ? desc(debtsTable.date) : asc(debtsTable.date);

  const rows = await db
    .select()
    .from(debtsTable)
    .where(search ? ilike(debtsTable.personName, `%${search}%`) : undefined)
    .orderBy(order);

  const result = rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
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

  res.status(201).json({
    ...row,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/debts/summary", async (req, res) => {
  const [summary] = await db
    .select({
      totalAmount: sql<number>`coalesce(sum(${debtsTable.amount}), 0)::numeric`,
      totalCount: sql<number>`count(*)::int`,
    })
    .from(debtsTable);

  res.json({
    totalAmount: Number(summary.totalAmount),
    totalCount: Number(summary.totalCount),
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

  res.json({
    ...row,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  });
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

  res.json({
    ...row,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  });
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

export default router;
