import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentDashboardData = async (userId: string) => {
  // 1. Fetch User Profile and Progress
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      progress: true, // totalScore, totalQuizzesCompleted
    },
  });

  // 2. Fetch Quiz History (Attempts)
  const quizHistory = await prisma.attempt.findMany({
    where: { userId },
    include: {
      assessment: {
        select: {
          title: true,
          weekNumber: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 10, // Limit to last 10 for dashboard performance
  });

  // 3. Fetch Achievement Stepper Data
  // We get ALL achievements so the frontend can show the "locked" ones in the stepper
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { createdAt: "asc" }, // Or use a custom logic for order
  });

  // Get the IDs of achievements the user has already earned
  const earnedAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, earnedAt: true },
  });

  const earnedIds = new Set(earnedAchievements.map((a) => a.achievementId));

  // Combine them for a stepper: mark which ones are 'unlocked'
  const achievementStepper = allAchievements.map((ach) => ({
    ...ach,
    isUnlocked: earnedIds.has(ach.id),
    earnedAt:
      earnedAchievements.find((ea) => ea.achievementId === ach.id)?.earnedAt ||
      null,
  }));

  return {
    user: {
      name: user?.name,
      totalScore: user?.progress?.totalScore || 0,
      totalQuizzes: user?.progress?.totalQuizzesCompleted || 0,
    },
    achievements: achievementStepper,
    history: quizHistory,
  };
};
