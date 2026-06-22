import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { doctors } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/doctors", async (req, res): Promise<void> => {
  try {
    const all = await db.select().from(doctors).orderBy(doctors.id);
    res.json(all);
  } catch {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

router.get("/doctors/:id", async (req, res): Promise<void> => {
  try {
    const [doc] = await db.select().from(doctors).where(eq(doctors.id, parseInt(req.params.id))).limit(1);
    if (!doc) { res.status(404).json({ error: "Doctor not found" }); return; }
    res.json(doc);
  } catch {
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

router.post("/doctors", requireAuth, async (req, res): Promise<void> => {
  try {
    const data = req.body;
    const [created] = await db.insert(doctors).values({
      name: data.name,
      qualification: data.qualification || "",
      specialization: data.specialization || "",
      experience: data.experience || 0,
      rating: data.rating || 4.5,
      reviewCount: data.reviewCount || 0,
      fee: data.fee || 500,
      hospital: data.hospital || "",
      clinicName: data.clinicName || "",
      address: data.address || "",
      city: data.city || "",
      phone: data.phone || "",
      about: data.about || "",
      languages: data.languages || [],
      availability: data.availability || "",
      timing: data.timing || "",
      isVerified: data.isVerified ?? false,
      isPremium: data.isPremium ?? false,
      emergencyAvailable: data.emergencyAvailable ?? false,
      gender: data.gender || "Male",
      consultationTypes: data.consultationTypes || ["clinic"],
      registrationNumber: data.registrationNumber || "",
      avatar: data.avatar || `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70)}`,
      location: data.location || { lat: 0, lng: 0, mapsUrl: "" },
      socials: data.socials || {},
      analytics: data.analytics || { impressions: 0, profileViews: 0, callClicks: 0, chatClicks: 0, bookings: 0, directionsClicks: 0, weeklyTrend: [0,0,0,0,0,0,0] },
      treatments: data.treatments || [],
      education: data.education || [],
      memberships: data.memberships || [],
      insurances: data.insurances || [],
      branches: data.branches || [],
    }).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create doctor" });
  }
});

router.put("/doctors/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const [updated] = await db.update(doctors).set({ ...data, updatedAt: new Date() }).where(eq(doctors.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Doctor not found" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

router.delete("/doctors/:id", requireSuperAdmin, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(doctors).where(eq(doctors.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete doctor" });
  }
});

router.post("/doctors/:id/analytics", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { event } = req.body as { event: "profileViews" | "callClicks" | "chatClicks" | "directionsClicks" | "bookings" | "impressions" };
    const [doc] = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
    if (!doc) { res.status(404).json({ error: "Doctor not found" }); return; }
    const analytics = { ...(doc.analytics as any) };
    if (analytics[event] !== undefined) analytics[event] += 1;
    const trend: number[] = analytics.weeklyTrend || [0,0,0,0,0,0,0];
    trend[6] = (trend[6] || 0) + 1;
    analytics.weeklyTrend = trend;
    await db.update(doctors).set({ analytics, updatedAt: new Date() }).where(eq(doctors.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to track event" });
  }
});

export default router;
