import express from "express";
import * as ProfileController from "./profile.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

// Student or Admin
router.get("/me", authMiddleware, ProfileController.getMyProfile);
router.put("/me", authMiddleware, ProfileController.updateProfile);

// Admin can view any user
router.get("/:userId", authMiddleware, ProfileController.getUserProfile);

export default router;
