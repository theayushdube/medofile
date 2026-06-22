import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "medofile_jwt_secret_2026";

export interface AuthPayload {
  id: number;
  username: string;
  role: "superadmin" | "admin";
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as any).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if ((req as any).admin?.role !== "superadmin") {
      res.status(403).json({ error: "Superadmin access required" });
      return;
    }
    next();
  });
}

export { JWT_SECRET };
