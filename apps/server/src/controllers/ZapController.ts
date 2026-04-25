import { CreateZapSchema } from "@repo/types";
import { Request, Response } from "express";
import { formatZodError } from "../helper";
import client from "@repo/db";

export const createZap = async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body;
    const validation = CreateZapSchema.safeParse(body);
    const id = req.id;

    if (!id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (validation.error) {
      return res.status(411).json({
        message: "Incorrect inputs",
        error: formatZodError(validation.error.flatten().fieldErrors),
      });
    }

    const zapId = await client.$transaction(async (tx) => {
      const zap = await tx.zap.create({
        data: {
          userId: id,
          actions: {
            create: validation?.data?.actions.map((x, index) => ({
              actionId: x.availableActionId as string,
              metadata: x.actionMetaData,
              sortingOrder: index + 1,
            })),
          },
        },
      });

      const trigger = await tx.trigger.create({
        data: {
          triggerID: validation?.data?.availableTriggerId,
          metadata: validation.data.triggerMetaData ?? {},
          zapId: zap.id,
        },
      });

      return zap.id;
    });

    return res.status(201).json({
      message: "Zap created successfully",
      zapId,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to create a zap!",
      error: error,
    });
  }
};

export const fetchZapList = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.id;
    if (!id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const zaps = await client.zap.findMany({
      where: {
        userId: id,
      },
      include: {
        actions: {
          include: {
            action: true,
          },
        },
        trigger: {
          include: {
            trigger: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Zaps fetched successsfully",
      data: {
        zaps,
        total: zaps.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Could not fetch the zaps!",
      error: error?.response,
    });
  }
};

export const fetchZapWithId = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.id;
    if (!id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const zap = await client.zap.findFirst({
      where: {
        userId: id,
        id: req.params.zapId,
      },
      include: {
        actions: {
          include: {
            action: true,
          },
        },
        trigger: {
          include: {
            trigger: true,
          },
        },
      },
    });

    if (!zap) {
      return res.status(404).json({
        message: "Zap not found",
      });
    }

    return res.status(200).json({
      message: "Zap fetched successfully",
      zap,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Could not fetch the zap",
      error: error,
    });
  }
};

export const deleteZapWithId = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.id;
    if (!id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const zap = await client.zap.findFirst({
      where: {
        id: req.params.zapId,
        userId: id,
      },
    });

    if (!zap) {
      return res.status(404).json({
        message: "Zap not found",
      });
    }

    const deletedZap = await client.$transaction(async (tx) => {
      await tx.trigger.delete({
        where: {
          zapId: req.params.zapId,
        },
      });

      await tx.action.deleteMany({
        where: {
          zapId: req.params.zapId,
        },
      });

      return await tx.zap.delete({
        where: {
          id: req.params.zapId,
        },
      });
    });

    return res.status(202).json({
      message: "Zap deleted successfully",
      deletedZap,
    });
  } catch (error: any) {
    res.status(401).json({
      message: "Could not delete the zap, Please try again",
      error: error.response,
    });
  }
};

export const renameZapWithId = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const id = req.id;
  const { name } = req.body;

  try {
    if (!id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existingZap = await client.zap.findFirst({
      where: {
        userId: id,
        id: req.params.zapId,
      },
    });

    if (!existingZap) {
      return res.status(404).json({ message: "Zap not found" });
    }

    const zap = await client.zap.update({
      where: {
        id: req.params.zapId,
      },
      data: {
        name: name,
      },
    });

    res.status(200).json({
      message: "Zap renamed successfully!",
      zap: zap,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Could not rename the zap!",
      error: error,
    });
  }
};

export const enableZapExecution = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const id = req.id;
  const { isActive } = req.body;

  try {
    if (!id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existingZap = await client.zap.findFirst({
      where: {
        userId: id,
        id: req.params.zapId,
      },
    });

    if (!existingZap) {
      return res.status(404).json({ message: "Zap not found" });
    }

    const zap = await client.zap.update({
      where: {
        id: req.params.zapId,
      },
      data: {
        isActive: isActive,
      },
    });

    res.status(200).json({
      message: "Zap renamed successfully!",
      zap: zap,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Could not rename the zap!",
      error: error,
    });
  }
};

export const updateZapWithId = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const id = req.id;
    const { availableTriggerId, triggerMetaData, actions } = req.body;

    if (!id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const validation = CreateZapSchema.safeParse(req.body);
    if (validation.error) {
      return res.status(411).json({
        message: "Incorrect inputs",
        error: formatZodError(validation.error.flatten().fieldErrors),
      });
    }

    const zap = await client.$transaction(async (tx) => {
      const existingZap = await tx.zap.findFirst({
        where: {
          userId: id,
          id: req.params.zapId,
        },
      });

      if (!existingZap) {
        throw new Error("Zap not found");
      }

      await tx.trigger.update({
        where: {
          zapId: req.params.zapId,
        },
        data: {
          triggerID: availableTriggerId,
          metadata: triggerMetaData ?? {},
        },
      });

      await tx.action.deleteMany({
        where: {
          zapId: req.params.zapId,
        },
      });

      await tx.zap.update({
        where: {
          id: req.params.zapId,
        },
        data: {
          actions: {
            create: actions.map((x: any, index: number) => ({
              actionId: x.availableActionId as string,
              metadata: x.actionMetaData,
              sortingOrder: index + 1,
            })),
          },
        },
      });

      return tx.zap.findUnique({
        where: {
          id: req.params.zapId,
        },
        include: {
          actions: {
            include: {
              action: true,
            },
          },
          trigger: {
            include: {
              trigger: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      message: "Zap updated successfully",
      zap,
    });
  } catch (error: any) {
    res.status(401).json({
      message: "Could not update the zap, please try again",
      error: error.response,
    });
  }
};
