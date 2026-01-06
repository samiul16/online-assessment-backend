import { Router } from "express";
import { getDashboardOverview } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// GET /api/student/dashboard
router.get("/dashboard", authMiddleware, getDashboardOverview);

export default router;
