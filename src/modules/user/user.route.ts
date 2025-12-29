import { Router } from "express";
import * as UserController from "./user.controller";
import {
  authAdminMiddleware,
  authMiddleware,
} from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", UserController.create);
router.get("/", authAdminMiddleware, UserController.list);

export default router;
