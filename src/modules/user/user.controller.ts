import { Request, Response } from "express";
import * as UserService from "./user.service";

export const create = async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  res.status(201).json(user);
};

export const list = async (_: Request, res: Response) => {
  const users = await UserService.getUsers();
  res.json(users);
};
