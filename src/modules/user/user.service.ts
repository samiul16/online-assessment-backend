import prisma from "../../config/prisma";
import { hashPassword } from "../../utils/hash";

export const createUser = async (data: any) => {
  data.password = await hashPassword(data.password);
  return prisma.user.create({ data });
};

export const getUsers = () => prisma.user.findMany();
