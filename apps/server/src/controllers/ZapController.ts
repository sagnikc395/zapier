import { CreateZapSchema } from "@repo/types";
import { Request, Response } from "express";
import { formatZodError } from "../helper";
import client from "@repo/db";

export const createZap = async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body;
    const validation = CreateZapSchema.safeParse(body);
    // @ts-ignore
    const id: string = req.id;

    if (validation.error) {
      return res.status(411).json({
        message: "Incorrect inputs",
        error: formatZodError(validation.error),
      });
    }

    const zapId = await client.$transaction(async (tx) => {
      const zap = await tx.zap.create({
        data: {
          userId: parseInt(id),
          triggerId: "",
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
          triggerId: validation?.data?.availableTriggerId,
          zapId: zap.id,
        },
      });

      await tx.zap.update({
        where: {
          id: zap.id,
        },
        data: {
          triggerId: trigger.id,
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
    // @ts-ignore
    const id = req.id;
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
    // @ts-ignore
    const id = req.id;
    const zap = await client.zap.findUnique({
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
    // @ts-ignore
    const id = req.id;
    const zap = await client.$transaction(async (tx) => {
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
          userId: id,
        },
      });
    });

    return res.status(202).json({
      message: "Zap deleted successfully",
      deletedZap: zap,
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
  // @ts-ignore
  const id = req.id;
  const { name } = req.body;

  try {
    const zap = await client.zap.update({
      where: {
        userId: id,
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
  // @ts-ignore
  const id = req.id;
  const { isActive } = req.body;

  try {
    const zap = await client.zap.update({
      where: {
        userId: id,
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
    // @ts-ignore
    const id = req.id;
    const { actions } = req.body;

    const zap = await client.$transaction(async (tx) => {
      if (actions.length) {
        await tx.action.deleteMany({
          where: {
            zapId: req.params.zapId,
          },
        });

        await tx.zap.update({
          where: {
            userId: id,
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
      }
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
