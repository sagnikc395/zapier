import { Router } from "express";
import { authMiddleware } from "../middlewares";
import { fetchAvailableTriggers } from "../controllers/TriggerController";

const router = Router();

router.get("/", authMiddleware, fetchAvailableTriggers);

export const TriggerRouter = router;
