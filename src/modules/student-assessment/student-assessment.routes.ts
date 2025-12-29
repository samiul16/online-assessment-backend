import express from "express";
import * as StudentAssessmentController from "./student-assessment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

// Get assessment for student (questions + options, exclude correct answer)
router.get(
  "/:assessmentId",
  authMiddleware,
  StudentAssessmentController.getAssessment
);

// Submit answers
router.post(
  "/:assessmentId/submit",
  authMiddleware,
  StudentAssessmentController.submitAnswers
);

// Get next question for student
router.get(
  "/:assessmentId/next-question",
  authMiddleware,
  StudentAssessmentController.getNextQuestion
);

export default router;
