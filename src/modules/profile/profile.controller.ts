import { Request, Response } from "express";
import * as ProfileService from "./profile.service";

export const getMyProfile = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const profile = await ProfileService.getUserProfile(req.user.userId);
  res.json(profile);
};

export const getUserProfile = async (req: Request, res: Response) => {
  const profile = await ProfileService.getUserProfile(req.params.userId);
  res.json(profile);
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const profile = await ProfileService.updateProfile(req.user.userId, req.body);
  res.json({ message: "Profile updated", profile });
};
