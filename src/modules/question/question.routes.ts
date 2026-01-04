import express from "express";
import * as QuestionController from "./question.controller";
import {
  authMiddleware,
  authAdminMiddleware,
} from "../../middlewares/auth.middleware";

const router = express.Router();

router.post(
  "/:assessmentId",
  authAdminMiddleware,
  QuestionController.createQuestion
);

router.get("/:assessmentId", authMiddleware, QuestionController.getQuestions);

router.get(
  "/:assessmentId/:questionId",
  authMiddleware,
  QuestionController.getQuestion
);

router.put(
  "/:assessmentId/:questionId",
  authAdminMiddleware,
  QuestionController.updateQuestion
);

router.delete(
  "/:assessmentId/:questionId",
  authAdminMiddleware,
  QuestionController.deleteQuestion
);

export default router;
