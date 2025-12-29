import { Router } from "express";
import * as AuthController from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { signupSchema, loginSchema } from "./auth.schema";

const router = Router();

// router.post("/signup", validate(signupSchema));
router.post("/signup", AuthController.signup);

// router.post("/login", validate(loginSchema));
router.post("/login", AuthController.login);

export default router;
