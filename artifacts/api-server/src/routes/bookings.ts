import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookings, careTimelineEvents, doctors, patientProfiles, scheduledReminders } from "@workspace/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getMedofileUserId, requireAuth, requireUserAuth } from "../middleware/auth.js";
import { scheduleInAppReminder } from "../services/reminderScheduler.js";

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
    const doctorId = Number(data.doctorId);
    if (!Number.isInteger(doctorId) || !data.patientName || !data.patientEmail || !data.patientPhone || !data.date || !data.time) {
      res.status(400).json({ error: "doctor, patient contact, date, and time are required" });
      return;
    }
    const patientClerkUserId = getMedofileUserId(req);
    if (patientClerkUserId) {
      await db
        .insert(patientProfiles)
        .values({
          clerkUserId: patientClerkUserId,
          name: String(data.patientName),
          email: String(data.patientEmail),
          phone: String(data.patientPhone),
        })
        .onConflictDoNothing({ target: patientProfiles.clerkUserId });
    }
    const [created] = await db.insert(bookings).values({
      doctorId,
      patientClerkUserId,
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
    if (patientClerkUserId) {
      await db.insert(careTimelineEvents).values({
        patientClerkUserId,
        bookingId: created!.id,
        doctorId,
        type: "appointment_booked",
        title: "Appointment booked",
        detail: `Appointment requested for ${created!.date} at ${created!.time}.`,
      });
      await scheduleInAppReminder(created!);
    }

    try {
      const [doc] = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
      if (doc) {
        const analytics = { ...(doc.analytics as any) };
        analytics.bookings = (analytics.bookings || 0) + 1;
        const trend: number[] = [...(analytics.weeklyTrend || [0,0,0,0,0,0,0])];
        trend[6] = (trend[6] || 0) + 1;
        analytics.weeklyTrend = trend;
        await db.update(doctors).set({ analytics, updatedAt: new Date() }).where(eq(doctors.id, doctorId));
      }
    } catch {}

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.put("/bookings/:id/status", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const { status } = req.body as { status: string };
    const [updated] = await db.update(bookings).set({ status, updatedAt: new Date(), ...(status === "cancelled" ? { cancelledAt: new Date() } : {}) }).where(eq(bookings.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Booking not found" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

router.put("/me/bookings/:id/reschedule", requireUserAuth, async (req, res): Promise<void> => {
  const bookingId = Number(req.params.id);
  const date = String(req.body?.date ?? "").trim();
  const time = String(req.body?.time ?? "").trim();
  if (!Number.isInteger(bookingId) || !date || !time) {
    res.status(400).json({ error: "A new date and time are required" });
    return;
  }
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.patientClerkUserId, req.medofileUserId!)))
    .limit(1);
  if (!booking) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (!["upcoming", "pending"].includes(booking.status)) {
    res.status(400).json({ error: "Only upcoming appointments can be rescheduled" });
    return;
  }
  const [updated] = await db.update(bookings).set({ date, time, rescheduledAt: new Date(), updatedAt: new Date() }).where(eq(bookings.id, bookingId)).returning();
  await db.insert(careTimelineEvents).values({
    patientClerkUserId: req.medofileUserId!,
    bookingId,
    doctorId: booking.doctorId,
    type: "appointment_rescheduled",
    title: "Appointment rescheduled",
    detail: `Moved from ${booking.date} at ${booking.time} to ${date} at ${time}.`,
  });
  await scheduleInAppReminder(updated!);
  res.json(updated);
});

router.post("/me/bookings/:id/cancel", requireUserAuth, async (req, res): Promise<void> => {
  const bookingId = Number(req.params.id);
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.patientClerkUserId, req.medofileUserId!)))
    .limit(1);
  if (!booking) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (!["upcoming", "pending"].includes(booking.status)) {
    res.status(400).json({ error: "Only upcoming appointments can be cancelled" });
    return;
  }
  const [updated] = await db.update(bookings).set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() }).where(eq(bookings.id, bookingId)).returning();
  await db.update(scheduledReminders).set({ status: "cancelled" }).where(and(eq(scheduledReminders.bookingId, bookingId), eq(scheduledReminders.status, "pending")));
  await db.insert(careTimelineEvents).values({
    patientClerkUserId: req.medofileUserId!,
    bookingId,
    doctorId: booking.doctorId,
    type: "appointment_cancelled",
    title: "Appointment cancelled",
    detail: "This appointment was cancelled from your Medofile care space.",
  });
  res.json(updated);
});

router.delete("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(bookings).where(eq(bookings.id, parseInt(String(req.params.id))));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

export default router;
