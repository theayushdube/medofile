import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { adminUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET } from "../middleware/auth.js";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  try {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    res.json({ id: payload.id, username: payload.username, role: payload.role });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
