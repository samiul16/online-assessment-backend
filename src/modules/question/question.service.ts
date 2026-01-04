import prisma from "../../config/prisma";

export const createQuestion = async (assessmentId: string, data: any) => {
  return prisma.question.create({
    data: {
      text: data.text,
      marks: data.marks ?? 1,
      image: data.image,
      assessmentId,
      options: {
        create: data.options.map((opt: any, index: number) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          serial: String.fromCharCode(65 + index), // A/B/C/D
        })),
      },
    },
    include: {
      options: true,
    },
  });
};

export const getQuestionsByAssessment = async (assessmentId: string) => {
  return prisma.question.findMany({
    where: { assessmentId },
    include: { options: true },
  });
};

export const getQuestionByAssessment = async (
  assessmentId: string,
  questionId: string
) => {
  return prisma.question.findFirst({
    where: {
      id: questionId,
      assessmentId,
    },
    include: { options: true },
  });
};

export const updateQuestionByAssessment = async (
  assessmentId: string,
  questionId: string,
  data: any
) => {
  return prisma.$transaction(async (tx) => {
    // Remove old options
    await tx.option.deleteMany({
      where: { questionId },
    });

    // Update question
    await tx.question.updateMany({
      where: { id: questionId, assessmentId },
      data: {
        text: data.text,
        marks: data.marks,
        image: data.image,
      },
    });

    // Recreate options
    await tx.option.createMany({
      data: data.options.map((opt: any, index: number) => ({
        questionId,
        text: opt.text,
        isCorrect: opt.isCorrect,
        serial: String.fromCharCode(65 + index),
      })),
    });

    return tx.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
  });
};

export const deleteQuestionByAssessment = async (
  assessmentId: string,
  questionId: string
) => {
  return prisma.question.deleteMany({
    where: {
      id: questionId,
      assessmentId,
    },
  });
};
