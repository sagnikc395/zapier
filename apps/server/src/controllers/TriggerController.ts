import client from "@repo/db";
import type { Request, Response } from "express";

export async function fetchAvailableTriggers(
  req: Request,
  res: Response,
): Promise<any> {
  const availableTriggers = await client.availableTriggers.findMany();

  return res.status(200).json({
    message: "Fetched available triggers",
    availableTriggers,
  });
}
