import prisma from "../../config/prisma";

export const createAssessment = async (data: {
  title: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status?: "DRAFT" | "PUBLISHED";
}) => {
  return prisma.assessment.create({
    data: {
      title: data.title,
      weekNumber: data.weekNumber,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status || "DRAFT",
    },
  });
};

export const updateAssessment = async (
  id: string,
  data: Partial<{
    title: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
    status: "DRAFT" | "PUBLISHED";
  }>
) => {
  return prisma.assessment.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
};

export const getAllAssessments = async (user: any) => {
  console.log("user ", user);
  const query: { status?: "DRAFT" | "PUBLISHED" } = {};

  if (user.roles.includes("ADMIN")) {
    // Admin can see all assessments
  } else {
    // Regular user can only see published assessments
    query.status = "PUBLISHED";
  }

  console.log("Query:", query);

  return prisma.assessment.findMany({
    where: query,
    orderBy: { createdAt: "desc" },
  });
};

export const getAssessmentDetails = async (id: string) => {
  console.log("assessment details id", id);
  return prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
};

export const deleteAssessment = async (id: string) => {
  return prisma.assessment.delete({
    where: { id },
  });
};

export const addQuestion = async (
  assessmentId: string,
  data: { text: string; marks?: number; image?: string }
) => {
  return prisma.question.create({
    data: {
      assessmentId,
      text: data.text,
      marks: data.marks || 1,
      image: data.image,
    },
  });
};

export const addOption = async (
  questionId: string,
  data: { serial: string; text: string; isCorrect?: boolean }
) => {
  if (data.isCorrect) {
    // unset other correct options
    await prisma.option.updateMany({
      where: { questionId },
      data: { isCorrect: false },
    });
  }

  return prisma.option.create({
    data: {
      questionId,
      serial: data.serial,
      text: data.text,
      isCorrect: data.isCorrect || false,
    },
  });
};

export const updateQuestion = async (
  questionId: string,
  data: Partial<{ text: string; marks: number; image: string }>
) => {
  return prisma.question.update({
    where: { id: questionId },
    data,
  });
};

export const deleteQuestion = async (questionId: string) => {
  return prisma.question.delete({
    where: { id: questionId },
  });
};

export const updateOption = async (
  optionId: string,
  data: Partial<{ text: string; serial: string; isCorrect: boolean }>
) => {
  if (data.isCorrect) {
    const option = await prisma.option.findUnique({ where: { id: optionId } });
    if (option) {
      await prisma.option.updateMany({
        where: { questionId: option.questionId },
        data: { isCorrect: false },
      });
    }
  }
  return prisma.option.update({ where: { id: optionId }, data });
};

export const deleteOption = async (optionId: string) => {
  return prisma.option.delete({ where: { id: optionId } });
};
