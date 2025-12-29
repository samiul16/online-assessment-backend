import { Request, Response } from "express";
import * as AssessmentService from "./assesment.service";

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const assessment = await AssessmentService.createAssessment(req.body);
    res.status(201).json({ message: "Assessment created", assessment });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const assessment = await AssessmentService.updateAssessment(
      req.params.id,
      req.body
    );
    res.json({ message: "Assessment updated", assessment });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    await AssessmentService.deleteAssessment(req.params.id);
    res.json({ message: "Assessment deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addQuestion = async (req: Request, res: Response) => {
  try {
    const question = await AssessmentService.addQuestion(
      req.params.assessmentId,
      req.body
    );
    res.status(201).json({ message: "Question added", question });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const question = await AssessmentService.updateQuestion(
      req.params.questionId,
      req.body
    );
    res.json({ message: "Question updated", question });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    await AssessmentService.deleteQuestion(req.params.questionId);
    res.json({ message: "Question deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addOption = async (req: Request, res: Response) => {
  try {
    const option = await AssessmentService.addOption(
      req.params.questionId,
      req.body
    );
    res.status(201).json({ message: "Option added", option });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOption = async (req: Request, res: Response) => {
  try {
    const option = await AssessmentService.updateOption(
      req.params.optionId,
      req.body
    );
    res.json({ message: "Option updated", option });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOption = async (req: Request, res: Response) => {
  try {
    await AssessmentService.deleteOption(req.params.optionId);
    res.json({ message: "Option deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
