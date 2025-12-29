import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = verifyToken(token);
    // Attach user to request
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("Request token", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    console.log("decoded", decoded);

    // Check if user has ADMIN role
    if (!decoded.roles.includes("ADMIN")) {
      return res.status(403).json({
        message: "Forbidden: Admin access required",
      });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authStudentMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("Request token", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    console.log("decoded", decoded);

    // Check if user has ADMIN role
    if (
      !decoded.roles.includes("ADMIN") ||
      !decoded.roles.includes("STUDENT")
    ) {
      return res.status(403).json({
        message: "Forbidden: Admin access required",
      });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
