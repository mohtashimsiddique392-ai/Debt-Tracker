import type { NextFunction, Request, Response } from "express";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error(
    "API_KEY environment variable is required but was not provided.",
  );
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}