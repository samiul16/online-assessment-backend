import { Request, Response } from "express";
import * as StudentService from "./student-assessment.service";

export const getAssessment = async (req: Request, res: Response) => {
  try {
    const assessment = await StudentService.getAssessmentForStudent(
      req.params.assessmentId
    );
    res.json({ assessment });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const submitAnswers = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const assessmentId = req.params.assessmentId;
    const answers = req.body.answers; // [{ questionId, optionId }, ...]

    const result = await StudentService.submitAssessmentAnswers(
      userId,
      assessmentId,
      answers
    );

    res.json({ message: "Assessment submitted", result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const assessmentId = req.params.assessmentId;

    const result = await StudentService.getNextQuestionForStudent(
      userId,
      assessmentId
    );

    // Stop overriding the result. The service now provides
    // either the next question OR the full history.
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const submitAnswerAndNext = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const assessmentId = req.params.assessmentId;
    const { optionId } = req.body;

    const result = await StudentService.submitAnswerAndGetNext(
      userId,
      assessmentId,
      optionId
    );

    if (!result.question) {
      return res.json({ message: "Assessment completed", score: result.score });
    }

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
