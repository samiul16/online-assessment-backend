import prisma from "../../config/prisma";

export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profile: true,
      attempts: {
        select: {
          id: true,
          score: true,
          startedAt: true,
          completedAt: true,
          assessment: {
            select: { title: true, weekNumber: true },
          },
        },
      },
      achievements: {
        include: {
          achievement: true,
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
};

export const updateProfile = async (userId: string, data: any) => {
  return prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
};
