import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookings, doctors, patientProfiles, savedDoctors } from "@workspace/db/schema";
import { requireUserAuth } from "../middleware/auth.js";

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
      .set({ status })
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

export default router;