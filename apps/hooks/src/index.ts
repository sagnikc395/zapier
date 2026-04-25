import express, { Request, Response } from "express";
import client from "@repo/db";
import "dotenv/config";

const app = express();
app.use(express.json());
const HOOKS_PORT = Number(process.env.HOOKS_PORT ?? 8000);

app.post("/hooks/:userId/:zapId", async (req: Request, res: Response) => {
  const { zapId } = req.params;

  //verify user using userId

  await client.$transaction(async (tx: any) => {
    const newZapRun = await tx.zapRun.create({
      data: {
        zapId: zapId as string,
        type: "webhook",
        image: JSON.stringify(req.body ?? {}),
      },
    });
    await tx.zapRunOutbox.create({
      data: {
        zapRunId: newZapRun.id,
      },
    });
    res.status(201).json({
      message: "Hook triggered",
    });
  });
});

app.listen(HOOKS_PORT, () => {
  console.log(`Hooks running on port http://localhost:${HOOKS_PORT}`);
});
