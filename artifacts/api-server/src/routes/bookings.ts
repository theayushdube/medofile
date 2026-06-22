import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookings, doctors } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  try {
    const all = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    res.json(all);
  } catch {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.post("/bookings", async (req, res): Promise<void> => {
  try {
    const data = req.body;
    const [created] = await db.insert(bookings).values({
      doctorId: parseInt(data.doctorId),
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone,
      patientProblem: data.patientProblem || "",
      date: data.date,
      time: data.time,
      type: data.type || "clinic",
      branch: data.branch || "",
      fee: data.fee || 0,
      status: "upcoming",
    }).returning();

    try {
      const [doc] = await db.select().from(doctors).where(eq(doctors.id, parseInt(data.doctorId))).limit(1);
      if (doc) {
        const analytics = { ...(doc.analytics as any) };
        analytics.bookings = (analytics.bookings || 0) + 1;
        const trend: number[] = [...(analytics.weeklyTrend || [0,0,0,0,0,0,0])];
        trend[6] = (trend[6] || 0) + 1;
        analytics.weeklyTrend = trend;
        await db.update(doctors).set({ analytics, updatedAt: new Date() }).where(eq(doctors.id, parseInt(data.doctorId)));
      }
    } catch {}

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.put("/bookings/:id/status", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: string };
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Booking not found" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

router.delete("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(bookings).where(eq(bookings.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

export default router;
