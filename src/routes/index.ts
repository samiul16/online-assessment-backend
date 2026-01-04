import { Router } from "express";
import userRoutes from "../modules/user/user.route";
import authRoutes from "../modules/auth/auth.route";
import assesmentRoutes from "../modules/assesment/assesment.route";
import profileRoutes from "../modules/profile/profile.routes";
import studentAssessmentRoutes from "../modules/student-assessment/student-assessment.routes";

import questionRoutes from "../modules/question/question.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/assessment", assesmentRoutes);
router.use("/questions", questionRoutes);
router.use("/student-assessments", studentAssessmentRoutes);
router.use("/profile", profileRoutes);

export default router;
