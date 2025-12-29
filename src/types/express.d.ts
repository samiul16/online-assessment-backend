import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        roles: string[];
        permissions?: string[];
      } & JwtPayload;
    }
  }
}
