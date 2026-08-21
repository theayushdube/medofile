import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getAuth } from "@clerk/express";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "medofile_jwt_secret_2026";

export interface AdminAuthPayload {
  id: number;
  username: string;
  role: "superadmin" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      medofileUserId?: string;
    }
  }
}

export function getMedofileUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth.sessionClaims?.userId?.toString() || auth.userId || null;
}

export function requireUserAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = getMedofileUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Please sign in to access your Medofile account" });
    return;
  }
  req.medofileUserId = userId;
  next();
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as AdminAuthPayload;
    (req as any).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAdminAuth(req, res, () => {
    if ((req as any).admin?.role !== "superadmin") {
      res.status(403).json({ error: "Superadmin access required" });
      return;
    }
    next();
  });
}

// Kept as an alias for existing admin routes during the migration to Clerk user accounts.
export const requireAuth = requireAdminAuth;
export { JWT_SECRET };
