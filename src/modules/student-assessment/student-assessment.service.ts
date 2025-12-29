import prisma from "../../config/prisma";

type AnswerInput = {
  questionId: string;
  optionId: string;
};

export const getAssessmentForStudent = async (assessmentId: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        include: {
          options: {
            select: {
              id: true,
              serial: true,
              text: true,
              // Do NOT include isCorrect
            },
          },
        },
      },
    },
  });

  if (!assessment) throw new Error("Assessment not found");
  return assessment;
};

export const submitAssessmentAnswers = async (
  userId: string,
  assessmentId: string,
  answers: AnswerInput[]
) => {
  // Start transaction
  return await prisma.$transaction(async (tx) => {
    // Create attempt
    const attempt = await tx.attempt.create({
      data: {
        userId,
        assessmentId,
      },
    });

    let totalScore = 0;

    for (const ans of answers) {
      const option = await tx.option.findUnique({
        where: { id: ans.optionId },
        include: { question: true },
      });
      if (!option) throw new Error("Option not found");

      // Check if correct
      if (option.isCorrect) totalScore += option.question.marks; // get marks from question

      // Save answer
      await tx.answer.create({
        data: {
          attemptId: attempt.id,
          optionId: ans.optionId,
        },
      });
    }

    // Update score
    await tx.attempt.update({
      where: { id: attempt.id },
      data: { score: totalScore, completedAt: new Date() },
    });

    return { attemptId: attempt.id, score: totalScore };
  });
};

// Get next unanswered question
export const getNextQuestionForStudent = async (
  userId: string,
  assessmentId: string
) => {
  // Find or create attempt
  let attempt = await prisma.attempt.findFirst({
    where: { userId, assessmentId, completedAt: null },
  });

  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: { userId, assessmentId },
    });
  }

  // Get all answered questionIds
  const answeredOptions = await prisma.answer.findMany({
    where: { attemptId: attempt.id },
    include: { option: true },
  });

  const answeredQuestionIds = answeredOptions.map((a) => a.option.questionId);

  // Get next unanswered question
  const nextQuestion = await prisma.question.findFirst({
    where: {
      assessmentId,
      NOT: { id: { in: answeredQuestionIds } },
    },
    include: {
      options: {
        select: { id: true, serial: true, text: true }, // hide correct answer
      },
    },
    orderBy: { id: "asc" }, // consistent order
  });

  return { attemptId: attempt.id, question: nextQuestion };
};

// Submit one answer and get next question
export const submitAnswerAndGetNext = async (
  userId: string,
  assessmentId: string,
  optionId: string
) => {
  return await prisma.$transaction(async (tx) => {
    // Find the active attempt
    let attempt = await tx.attempt.findFirst({
      where: { userId, assessmentId, completedAt: null },
    });
    if (!attempt) {
      attempt = await tx.attempt.create({
        data: { userId, assessmentId },
      });
    }

    const option = await tx.option.findUnique({
      where: { id: optionId },
      include: { question: true },
    });
    if (!option) throw new Error("Option not found");

    // Save answer
    await tx.answer.create({
      data: {
        attemptId: attempt.id,
        optionId,
      },
    });

    // Update score if correct
    if (option.isCorrect) {
      attempt = await tx.attempt.update({
        where: { id: attempt.id },
        data: { score: attempt.score + option.question.marks },
      });
    }

    // Get next question
    const answeredOptions = await tx.answer.findMany({
      where: { attemptId: attempt.id },
      include: { option: true },
    });
    const answeredQuestionIds = answeredOptions.map((a) => a.option.questionId);

    const nextQuestion = await tx.question.findFirst({
      where: {
        assessmentId,
        NOT: { id: { in: answeredQuestionIds } },
      },
      include: { options: { select: { id: true, serial: true, text: true } } },
      orderBy: { id: "asc" },
    });

    // Mark attempt as completed if no more questions
    if (!nextQuestion) {
      await tx.attempt.update({
        where: { id: attempt.id },
        data: { completedAt: new Date() },
      });
    }

    return {
      attemptId: attempt.id,
      question: nextQuestion,
      score: attempt.score,
    };
  });
};
