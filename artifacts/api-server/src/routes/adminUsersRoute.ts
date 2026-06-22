import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/admin/users", requireSuperAdmin, async (req, res): Promise<void> => {
  try {
    const all = await db.select({ id: adminUsers.id, username: adminUsers.username, role: adminUsers.role, createdAt: adminUsers.createdAt }).from(adminUsers);
    res.json(all);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/admin/users", requireSuperAdmin, async (req, res): Promise<void> => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) { res.status(400).json({ error: "Username and password required" }); return; }
    const passwordHash = await bcrypt.hash(password, 12);
    const [created] = await db.insert(adminUsers).values({ username, passwordHash, role: role || "admin" }).returning({ id: adminUsers.id, username: adminUsers.username, role: adminUsers.role });
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.constraint?.includes("unique")) { res.status(409).json({ error: "Username already exists" }); return; }
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.delete("/admin/users/:id", requireSuperAdmin, async (req, res): Promise<void> => {
  try {
    await db.delete(adminUsers).where(eq(adminUsers.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
