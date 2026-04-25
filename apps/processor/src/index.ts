import kafka from "@repo/kafka";
import client from "@repo/db";
import "dotenv/config";

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (true) {
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {
        zapRun: {
          zap: {
            isActive: true,
          },
        },
      },
      take: 10,
    });

    if (pendingRows.length > 0) {
      await producer.send({
        topic: "zap-events",
        messages: pendingRows.map((r: { zapRunId: string }) => ({
          value: JSON.stringify({ zapRunId: r?.zapRunId, stage: 1 }),
        })),
      });
    }

    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((r: { id: string }) => r.id),
        },
      },
    });

    await new Promise((r) => setTimeout(r, 3000));
  }
}

main();
