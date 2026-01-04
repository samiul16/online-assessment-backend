import express from "express";
import * as AssessmentController from "./assesment.controller";
import * as StudentAssessmentController from "../student-assessment/student-assessment.controller";
import {
  authAdminMiddleware,
  authMiddleware,
} from "../../middlewares/auth.middleware";

const router = express.Router();

// Protect all assessment routes with admin middleware
// router.use(authAdminMiddleware);

// Assessment CRUD
router.post("/", AssessmentController.createAssessment);
router.put("/:id", AssessmentController.updateAssessment);
router.delete("/:id", AssessmentController.deleteAssessment);
router.get("/", authMiddleware, AssessmentController.getAllAssessments);
router.get("/:id", authMiddleware, AssessmentController.getAssessmentDetails);

// Question CRUD
router.post("/:assessmentId/question", AssessmentController.addQuestion);
router.put("/question/:questionId", AssessmentController.updateQuestion);
router.delete("/question/:questionId", AssessmentController.deleteQuestion);

// Option CRUD
router.post("/question/:questionId/option", AssessmentController.addOption);
router.put("/option/:optionId", AssessmentController.updateOption);
router.delete("/option/:optionId", AssessmentController.deleteOption);

// Get next question without submitting
router.get(
  "/:assessmentId/next-question",
  authMiddleware,
  StudentAssessmentController.getNextQuestion
);

// Submit answer and get next question
router.post(
  "/:assessmentId/next-question",
  authMiddleware,
  StudentAssessmentController.submitAnswerAndNext
);

export default router;
