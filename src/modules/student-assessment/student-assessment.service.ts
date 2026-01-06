import { AchievementName } from "@prisma/client";
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
  // 1. Find the latest attempt
  let attempt = await prisma.attempt.findFirst({
    where: { userId, assessmentId },
    orderBy: { startedAt: "desc" },
  });

  // Helper function to fetch full history with user answers
  const fetchHistory = async (attemptId: string, currentScore: number) => {
    const quizHistory = await prisma.question.findMany({
      where: { assessmentId },
      include: {
        options: {
          include: {
            answers: { where: { attemptId } },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return {
      completed: true,
      attemptId,
      score: currentScore,
      totalQuestions: quizHistory.length,
      questions: quizHistory.map((q) => ({
        id: q.id,
        text: q.text,
        marks: q.marks,
        image: q.image,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          serial: o.serial,
          isCorrect: o.isCorrect,
          isSelected: o.answers.length > 0,
        })),
      })),
    };
  };

  // 2. Scenario: Quiz is already marked as COMPLETED in DB
  if (attempt && attempt.completedAt) {
    return await fetchHistory(attempt.id, attempt.score);
  }

  // 3. Scenario: Create NEW attempt if none exists
  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: { userId, assessmentId },
    });
  }

  // 4. Scenario: Quiz is IN PROGRESS - Find next question
  const answeredOptions = await prisma.answer.findMany({
    where: { attemptId: attempt.id },
    select: { option: { select: { questionId: true } } },
  });

  const answeredQuestionIds = answeredOptions.map((a) => a.option.questionId);

  const nextQuestion = await prisma.question.findFirst({
    where: {
      assessmentId,
      NOT: { id: { in: answeredQuestionIds } },
    },
    include: {
      options: {
        select: { id: true, serial: true, text: true },
      },
    },
    orderBy: { id: "asc" },
  });

  // 5. Scenario: Just finished (No more questions left)
  if (!nextQuestion) {
    // Mark as completed if not already
    if (!attempt.completedAt) {
      attempt = await prisma.attempt.update({
        where: { id: attempt.id },
        data: { completedAt: new Date() },
      });
    }
    return await fetchHistory(attempt.id, attempt.score);
  }

  // 6. Return the single next question
  return {
    completed: false,
    attemptId: attempt.id,
    question: nextQuestion,
  };
};

// Submit one answer and get next question

export const submitAnswerAndGetNext = async (
  userId: string,
  assessmentId: string,
  optionId: string
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the active attempt
    let attempt = await tx.attempt.findFirst({
      where: { userId, assessmentId, completedAt: null },
    });

    if (!attempt) {
      throw new Error("No active attempt found for this quiz.");
    }

    // 2. Validate the option
    const option = await tx.option.findUnique({
      where: { id: optionId },
      include: { question: true },
    });
    if (!option) throw new Error("Option not found");

    // 3. Save current answer
    await tx.answer.create({
      data: {
        attemptId: attempt.id,
        optionId,
      },
    });

    // 4. Update current attempt score if correct
    if (option.isCorrect) {
      attempt = await tx.attempt.update({
        where: { id: attempt.id },
        data: { score: attempt.score + option.question.marks },
      });
    }

    // 5. Check if there are more questions
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

    let unlockedAchievement = null;

    // 6. IF QUIZ IS COMPLETE
    if (!nextQuestion) {
      // Mark attempt as completed
      await tx.attempt.update({
        where: { id: attempt.id },
        data: { completedAt: new Date() },
      });

      // UPDATE USER GLOBAL PROGRESS
      const progress = await tx.userProgress.upsert({
        where: { userId: userId },
        update: {
          totalScore: { increment: attempt.score },
          totalQuizzesCompleted: { increment: 1 },
        },
        create: {
          userId: userId,
          totalScore: attempt.score,
          totalQuizzesCompleted: 1,
        },
      });

      /* ========================================================
         SERIAL ACHIEVEMENT LOGIC (ONE AFTER ANOTHER)
         ======================================================== */

      // Define the order based on your Enums
      const achievementOrder: AchievementName[] = [
        AchievementName.NOVICE_SCHOLAR,
        AchievementName.RISING_STAR,
        AchievementName.SKILL_SEEKER,
        AchievementName.KNOWLEDGE_MASTER,
        AchievementName.PRO_EXPLORER,
        AchievementName.ELITE_ADVENTURER,
        AchievementName.GRAND_WIZARD,
        AchievementName.UNIVERSAL_LEGEND,
      ];

      // Determine level based on total quizzes completed
      // e.g., 1st quiz = Index 0 (Novice), 2nd quiz = Index 1 (Rising Star)
      const currentLevelIndex = progress.totalQuizzesCompleted - 1;

      if (currentLevelIndex < achievementOrder.length) {
        const targetEnum = achievementOrder[currentLevelIndex];

        // Find the achievement definition in the DB
        const achievementDef = await tx.achievement.findUnique({
          where: { name: targetEnum },
        });

        if (achievementDef) {
          // Check if user already owns this specific achievement
          const existingAssignment = await tx.userAchievement.findFirst({
            where: {
              userId: userId,
              achievementId: achievementDef.id,
            },
          });

          // Award it if they don't have it yet
          if (!existingAssignment) {
            await tx.userAchievement.create({
              data: {
                userId: userId,
                achievementId: achievementDef.id,
              },
            });
            unlockedAchievement = achievementDef; // Store to return to frontend
          }
        }
      }
    }

    return {
      attemptId: attempt.id,
      question: nextQuestion, // null if quiz is over
      score: attempt.score,
      completed: !nextQuestion,
      unlockedAchievement, // This will contain the achievement data if one was just earned
    };
  });
};
