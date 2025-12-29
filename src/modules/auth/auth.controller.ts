import { Request, Response } from "express";
import * as AuthService from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  const result = await AuthService.signup(req.body);

  res.status(201).json({
    message: "Signup successful",
    user: result.user,
    token: result.token,
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    // Accept both 'email' and 'identifier' for backward compatibility
    const { email, phone, password } = req.body;

    // Use identifier if provided, otherwise fall back to email
    const loginIdentifier = phone || email;

    if (!loginIdentifier) {
      return res.status(400).json({
        message: "Email or phone number is required",
      });
    }

    const result = await AuthService.login(loginIdentifier, password);

    res.json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Invalid credentials",
    });
  }
};
