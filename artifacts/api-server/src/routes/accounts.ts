import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookings, careDocuments, careTimelineEvents, doctorFollowUps, doctors, patientProfiles, reminderPreferences, savedDoctors, scheduledReminders } from "@workspace/db/schema";
import { requireUserAuth } from "../middleware/auth.js";
import { scheduleInAppReminder } from "../services/reminderScheduler.js";

const router: IRouter = Router();

async function ensurePatientProfile(userId: string) {
  await db
    .insert(patientProfiles)
    .values({ clerkUserId: userId })
    .onConflictDoNothing({ target: patientProfiles.clerkUserId });

  const [profile] = await db
    .select()
    .from(patientProfiles)
    .where(eq(patientProfiles.clerkUserId, userId))
    .limit(1);
  return profile;
}

router.get("/me", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const profile = await ensurePatientProfile(req.medofileUserId!);
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.ownerClerkUserId, req.medofileUserId!))
      .limit(1);
    res.json({ profile, role: doctor ? "doctor" : "patient", doctorId: doctor?.id ?? null });
  } catch {
    res.status(500).json({ error: "Failed to load account" });
  }
});

router.put("/me", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const allowed = ["name", "email", "phone", "avatar"] as const;
    const updates = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([key, value]) => allowed.includes(key as (typeof allowed)[number]) && typeof value === "string"),
    );
    await ensurePatientProfile(req.medofileUserId!);
    const [profile] = await db
      .update(patientProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patientProfiles.clerkUserId, req.medofileUserId!))
      .returning();
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Failed to update account" });
  }
});

router.get("/me/saved-doctors", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select({ doctor: doctors, savedAt: savedDoctors.createdAt })
      .from(savedDoctors)
      .innerJoin(doctors, eq(savedDoctors.doctorId, doctors.id))
      .where(eq(savedDoctors.clerkUserId, req.medofileUserId!))
      .orderBy(desc(savedDoctors.createdAt));
    res.json(rows.map(({ doctor, savedAt }) => ({ ...doctor, savedAt })));
  } catch {
    res.status(500).json({ error: "Failed to load saved doctors" });
  }
});

router.post("/me/saved-doctors/:doctorId", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const doctorId = Number(req.params.doctorId);
    if (!Number.isInteger(doctorId)) {
      res.status(400).json({ error: "Invalid doctor id" });
      return;
    }
    const [doctor] = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.id, doctorId)).limit(1);
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    await db
      .insert(savedDoctors)
      .values({ clerkUserId: req.medofileUserId!, doctorId })
      .onConflictDoNothing({ target: [savedDoctors.clerkUserId, savedDoctors.doctorId] });
    res.status(201).json({ doctorId, saved: true });
  } catch {
    res.status(500).json({ error: "Failed to save doctor" });
  }
});

router.delete("/me/saved-doctors/:doctorId", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const doctorId = Number(req.params.doctorId);
    await db
      .delete(savedDoctors)
      .where(and(eq(savedDoctors.clerkUserId, req.medofileUserId!), eq(savedDoctors.doctorId, doctorId)));
    res.json({ doctorId, saved: false });
  } catch {
    res.status(500).json({ error: "Failed to remove saved doctor" });
  }
});

router.get("/me/bookings", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select({ booking: bookings, doctor: doctors })
      .from(bookings)
      .innerJoin(doctors, eq(bookings.doctorId, doctors.id))
      .where(eq(bookings.patientClerkUserId, req.medofileUserId!))
      .orderBy(desc(bookings.createdAt));
    res.json(rows.map(({ booking, doctor }) => ({ ...booking, doctor })));
  } catch {
    res.status(500).json({ error: "Failed to load care history" });
  }
});

router.get("/me/timeline", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const userId = req.medofileUserId!;
    const [events, documents, followUps] = await Promise.all([
      db.select().from(careTimelineEvents).where(eq(careTimelineEvents.patientClerkUserId, userId)).orderBy(desc(careTimelineEvents.createdAt)),
      db.select().from(careDocuments).where(eq(careDocuments.patientClerkUserId, userId)).orderBy(desc(careDocuments.createdAt)),
      db.select({ followUp: doctorFollowUps, doctor: doctors }).from(doctorFollowUps).innerJoin(doctors, eq(doctorFollowUps.doctorId, doctors.id)).where(eq(doctorFollowUps.patientClerkUserId, userId)).orderBy(desc(doctorFollowUps.createdAt)),
    ]);
    res.json({ events, documents, followUps: followUps.map(({ followUp, doctor }) => ({ ...followUp, doctor })) });
  } catch {
    res.status(500).json({ error: "Failed to load your care timeline" });
  }
});

router.post("/me/documents", requireUserAuth, async (req, res): Promise<void> => {
  const kind = String(req.body?.kind ?? "");
  const title = String(req.body?.title ?? "").trim();
  const note = String(req.body?.note ?? "").trim();
  const fileUrl = String(req.body?.fileUrl ?? "").trim();
  if (!["prescription", "report"].includes(kind) || !title || title.length > 120 || note.length > 1000) {
    res.status(400).json({ error: "A valid document type, title, and concise note are required" });
    return;
  }
  const [document] = await db.insert(careDocuments).values({ patientClerkUserId: req.medofileUserId!, kind, title, note, fileUrl }).returning();
  await db.insert(careTimelineEvents).values({
    patientClerkUserId: req.medofileUserId!,
    type: kind === "prescription" ? "prescription_saved" : "report_saved",
    title: kind === "prescription" ? "Prescription saved" : "Health report saved",
    detail: title,
  });
  res.status(201).json(document);
});

router.post("/me/timeline/ai-conversations", requireUserAuth, async (req, res): Promise<void> => {
  const summary = String(req.body?.summary ?? "").trim();
  if (!summary || summary.length > 1600) {
    res.status(400).json({ error: "A concise AI conversation summary is required" });
    return;
  }
  const [event] = await db.insert(careTimelineEvents).values({
    patientClerkUserId: req.medofileUserId!,
    type: "ai_conversation",
    title: "AI health conversation",
    detail: summary,
  }).returning();
  res.status(201).json(event);
});

router.get("/me/reminder-preferences", requireUserAuth, async (req, res): Promise<void> => {
  const userId = req.medofileUserId!;
  await db.insert(reminderPreferences).values({ patientClerkUserId: userId }).onConflictDoNothing({ target: reminderPreferences.patientClerkUserId });
  const [preferences] = await db.select().from(reminderPreferences).where(eq(reminderPreferences.patientClerkUserId, userId)).limit(1);
  res.json(preferences);
});

router.put("/me/reminder-preferences", requireUserAuth, async (req, res): Promise<void> => {
  const userId = req.medofileUserId!;
  const source = req.body ?? {};
  const updates = Object.fromEntries(
    Object.entries(source).filter(([key, value]) =>
      (["inApp", "email", "push", "whatsapp"].includes(key) && typeof value === "boolean") ||
      (key === "reminderHours" && Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 168),
    ),
  );
  await db.insert(reminderPreferences).values({ patientClerkUserId: userId }).onConflictDoNothing({ target: reminderPreferences.patientClerkUserId });
  const [preferences] = await db.update(reminderPreferences).set({ ...updates, updatedAt: new Date() }).where(eq(reminderPreferences.patientClerkUserId, userId)).returning();
  if (preferences && updates.inApp === false) {
    await db.update(scheduledReminders).set({ status: "skipped" }).where(and(eq(scheduledReminders.patientClerkUserId, userId), eq(scheduledReminders.status, "pending")));
  }
  if (preferences && (updates.inApp === true || typeof updates.reminderHours === "number")) {
    const upcomingBookings = await db.select().from(bookings).where(and(eq(bookings.patientClerkUserId, userId), eq(bookings.status, "upcoming")));
    await Promise.all(upcomingBookings.map((booking) => scheduleInAppReminder(booking)));
  }
  res.json(preferences);
});

router.get("/me/doctor/dashboard", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.ownerClerkUserId, req.medofileUserId!))
      .limit(1);
    if (!doctor) {
      res.status(404).json({ error: "No doctor profile belongs to this account" });
      return;
    }
    const doctorBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.doctorId, doctor.id))
      .orderBy(desc(bookings.createdAt));
    const completed = doctorBookings.filter((booking) => booking.status === "completed").length;
    const pending = doctorBookings.filter((booking) => booking.status === "upcoming" || booking.status === "pending").length;
    const profileFields = [
      doctor.qualification, doctor.about, doctor.address, doctor.phone,
      doctor.timing, doctor.availability, doctor.avatar,
    ];
    const profileCompleteness = Math.round(
      (profileFields.filter(Boolean).length / profileFields.length) * 100,
    );
    const analytics = doctor.analytics ?? {
      impressions: 0, profileViews: 0, callClicks: 0, chatClicks: 0, bookings: 0, directionsClicks: 0, weeklyTrend: [],
    };
    const conversionRate = analytics.profileViews > 0
      ? Math.round((doctorBookings.length / analytics.profileViews) * 1000) / 10
      : 0;
    res.json({
      doctor,
      analytics,
      bookings: doctorBookings,
      summary: { total: doctorBookings.length, pending, completed, conversionRate, profileCompleteness },
      nextActions: [
        ...(profileCompleteness < 100 ? ["Complete your public profile to build patient trust."] : []),
        ...(!doctor.isAcceptingBookings ? ["Turn on bookings when you are ready to receive new care requests."] : []),
        ...(doctor.languages.length === 0 ? ["Add spoken languages so patients can find you more easily."] : []),
      ],
    });
  } catch {
    res.status(500).json({ error: "Failed to load doctor workspace" });
  }
});

router.put("/me/doctor/profile", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const allowed = [
      "name", "qualification", "specialization", "experience", "fee", "hospital", "clinicName",
      "address", "city", "phone", "about", "languages", "availability", "timing", "gender",
      "consultationTypes", "registrationNumber", "avatar", "location", "socials", "treatments",
      "education", "memberships", "insurances", "branches", "emergencyAvailable", "isAcceptingBookings",
    ];
    const updates = Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => allowed.includes(key)));
    const [doctor] = await db
      .update(doctors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(doctors.ownerClerkUserId, req.medofileUserId!))
      .returning();
    if (!doctor) {
      res.status(404).json({ error: "No doctor profile belongs to this account" });
      return;
    }
    res.json(doctor);
  } catch {
    res.status(500).json({ error: "Failed to update doctor profile" });
  }
});

router.put("/me/doctor/bookings/:id/status", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const status = String(req.body?.status ?? "");
    if (!["upcoming", "pending", "completed", "cancelled"].includes(status)) {
      res.status(400).json({ error: "Invalid booking status" });
      return;
    }
    const bookingId = Number(req.params.id);
    const [doctor] = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.ownerClerkUserId, req.medofileUserId!)).limit(1);
    if (!doctor) {
      res.status(403).json({ error: "Doctor account required" });
      return;
    }
    const [updated] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(bookings.id, bookingId), eq(bookings.doctorId, doctor.id)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

router.post("/me/doctor/bookings/:id/follow-up", requireUserAuth, async (req, res): Promise<void> => {
  const bookingId = Number(req.params.id);
  const instructions = String(req.body?.instructions ?? "").trim();
  if (!Number.isInteger(bookingId) || instructions.length < 10 || instructions.length > 2000) {
    res.status(400).json({ error: "Care instructions must be between 10 and 2,000 characters" });
    return;
  }
  const [doctor] = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.ownerClerkUserId, req.medofileUserId!)).limit(1);
  const [booking] = doctor
    ? await db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.doctorId, doctor.id))).limit(1)
    : [];
  if (!doctor || !booking || !booking.patientClerkUserId) {
    res.status(404).json({ error: "A signed-in patient appointment is required for follow-up instructions" });
    return;
  }
  if (booking.status !== "completed") {
    res.status(400).json({ error: "Care instructions can be sent after a completed appointment" });
    return;
  }
  const [existingFollowUp] = await db.select().from(doctorFollowUps).where(eq(doctorFollowUps.bookingId, bookingId)).limit(1);
  const [followUp] = await db.insert(doctorFollowUps).values({
    bookingId, doctorId: doctor.id, patientClerkUserId: booking.patientClerkUserId, instructions,
  }).onConflictDoUpdate({
    target: doctorFollowUps.bookingId,
    set: { instructions, updatedAt: new Date() },
  }).returning();
  if (existingFollowUp) {
    const [existingEvent] = await db.select().from(careTimelineEvents).where(and(eq(careTimelineEvents.bookingId, bookingId), eq(careTimelineEvents.type, "doctor_follow_up"))).orderBy(desc(careTimelineEvents.createdAt)).limit(1);
    if (existingEvent) await db.update(careTimelineEvents).set({ detail: instructions }).where(eq(careTimelineEvents.id, existingEvent.id));
  } else {
    await db.insert(careTimelineEvents).values({
      patientClerkUserId: booking.patientClerkUserId,
      bookingId,
      doctorId: doctor.id,
      type: "doctor_follow_up",
      title: "Care instructions from your doctor",
      detail: instructions,
    });
  }
  res.status(201).json(followUp);
});

export default router;