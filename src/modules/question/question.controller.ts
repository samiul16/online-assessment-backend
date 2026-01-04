import { Request, Response } from "express";
import * as QuestionService from "./question.service";

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { text, marks, image, options } = req.body;

    console.log("req body===> ", req.body);

    if (!text || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "Question text and at least 2 options are required",
      });
    }

    const question = await QuestionService.createQuestion(
      assessmentId,
      req.body
    );

    res.status(201).json({
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create question" });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;

    const questions = await QuestionService.getQuestionsByAssessment(
      assessmentId
    );

    res.json({ data: questions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { assessmentId, questionId } = req.params;

    const question = await QuestionService.getQuestionByAssessment(
      assessmentId,
      questionId
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ data: question });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch question" });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { assessmentId, questionId } = req.params;

    const updated = await QuestionService.updateQuestionByAssessment(
      assessmentId,
      questionId,
      req.body
    );

    res.json({
      message: "Question updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update question" });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { assessmentId, questionId } = req.params;

    await QuestionService.deleteQuestionByAssessment(assessmentId, questionId);

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question" });
  }
};
