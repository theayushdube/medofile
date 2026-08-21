import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { doctors } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getMedofileUserId, requireAuth, requireSuperAdmin, requireUserAuth } from "../middleware/auth.js";

const router: IRouter = Router();
type DoctorAnalytics = {
  impressions: number;
  profileViews: number;
  callClicks: number;
  chatClicks: number;
  bookings: number;
  directionsClicks: number;
  weeklyTrend: number[];
};

router.get("/doctors", async (req, res): Promise<void> => {
  try {
    const all = await db.select().from(doctors).orderBy(doctors.id);
    const query = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const city = typeof req.query.city === "string" ? req.query.city.trim().toLowerCase() : "";
    const specialization = typeof req.query.specialization === "string" ? req.query.specialization.trim().toLowerCase() : "";
    const language = typeof req.query.language === "string" ? req.query.language.trim().toLowerCase() : "";
    const gender = typeof req.query.gender === "string" ? req.query.gender.trim().toLowerCase() : "";
    const consultationType = typeof req.query.consultationType === "string" ? req.query.consultationType.trim().toLowerCase() : "";
    const availability = typeof req.query.availability === "string" ? req.query.availability.trim().toLowerCase() : "";
    const minFee = Number(req.query.minFee);
    const maxFee = Number(req.query.maxFee);
    const sort = typeof req.query.sort === "string" ? req.query.sort : "relevance";

    let result = all.filter((doctor) => {
      const searchable = [doctor.name, doctor.specialization, doctor.city, doctor.hospital, doctor.clinicName]
        .join(" ")
        .toLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (!city || doctor.city.toLowerCase().includes(city)) &&
        (!specialization || doctor.specialization.toLowerCase().includes(specialization)) &&
        (!language || doctor.languages.some((item) => item.toLowerCase().includes(language))) &&
        (!gender || gender === "all" || doctor.gender.toLowerCase() === gender) &&
        (!consultationType || doctor.consultationTypes.includes(consultationType)) &&
        (!availability || availability === "all" || availability === "available" ? (!availability || availability === "all" || doctor.isAcceptingBookings) : true) &&
        (!Number.isFinite(minFee) || doctor.fee >= minFee) &&
        (!Number.isFinite(maxFee) || doctor.fee <= maxFee)
      );
    });
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === "fee") result = [...result].sort((a, b) => a.fee - b.fee);
    if (sort === "experience") result = [...result].sort((a, b) => b.experience - a.experience);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 24));
    const total = result.length;
    res.json({ data: result.slice((page - 1) * limit, page * limit), meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

router.get("/doctors/suggestions", async (req, res): Promise<void> => {
  try {
    const { specializations, city } = req.query as { specializations?: string; city?: string };
    const allDocs = await db.select().from(doctors);
    let result = allDocs;
    if (specializations) {
      const specs = specializations.split(",").map((s) => s.trim().toLowerCase());
      result = result.filter((d) => specs.some((s) => d.specialization.toLowerCase().includes(s)));
    }
    if (city && city.trim()) {
      result = result.filter((d) => d.city.toLowerCase().includes(city.toLowerCase()));
    }
    result = result.sort((a, b) => b.rating - a.rating).slice(0, 4);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

router.post("/doctors/register", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const data = req.body ?? {};
    if (!data.name || !data.specialization || !data.city || !data.phone) {
      res.status(400).json({ error: "name, specialization, city, and phone are required" });
      return;
    }
    const ownerClerkUserId = req.medofileUserId!;
    const [existing] = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.ownerClerkUserId, ownerClerkUserId)).limit(1);
    if (existing) {
      res.status(409).json({ error: "This account already owns a doctor profile", doctorId: existing.id });
      return;
    }
    const [created] = await db.insert(doctors).values({
      ownerClerkUserId,
      name: data.name,
      qualification: data.qualification || "",
      specialization: data.specialization,
      experience: Number(data.experience) || 0,
      rating: 0,
      reviewCount: 0,
      fee: Number(data.fee) || 500,
      hospital: data.hospital || "",
      clinicName: data.clinicName || "",
      address: data.address || "",
      city: data.city,
      phone: data.phone,
      about: data.about || "",
      languages: Array.isArray(data.languages) ? data.languages : [],
      availability: data.availability || "",
      timing: data.timing || "",
      isAcceptingBookings: data.isAcceptingBookings ?? true,
      isVerified: false,
      isPremium: false,
      emergencyAvailable: Boolean(data.emergencyAvailable),
      gender: data.gender || "Male",
      consultationTypes: Array.isArray(data.consultationTypes) ? data.consultationTypes : ["clinic"],
      registrationNumber: data.registrationNumber || "",
      avatar: data.avatar || `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70)}`,
      location: data.location || { lat: 0, lng: 0, mapsUrl: "" },
      socials: data.socials || {},
      analytics: { impressions: 0, profileViews: 0, callClicks: 0, chatClicks: 0, bookings: 0, directionsClicks: 0, weeklyTrend: [0,0,0,0,0,0,0] },
      treatments: Array.isArray(data.treatments) ? data.treatments : [],
      education: Array.isArray(data.education) ? data.education : [],
      memberships: Array.isArray(data.memberships) ? data.memberships : [],
      insurances: Array.isArray(data.insurances) ? data.insurances : [],
      branches: Array.isArray(data.branches) ? data.branches : [],
    }).returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to register doctor" });
  }
});

router.get("/doctors/:id", async (req, res): Promise<void> => {
  try {
    const [doc] = await db.select().from(doctors).where(eq(doctors.id, parseInt(req.params.id))).limit(1);
    if (!doc) { res.status(404).json({ error: "Doctor not found" }); return; }
    const analytics: DoctorAnalytics = Object.assign({
      impressions: 0,
      profileViews: 0,
      callClicks: 0,
      chatClicks: 0,
      bookings: 0,
      directionsClicks: 0,
      weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
    } satisfies DoctorAnalytics, doc.analytics ?? {});
    analytics.profileViews += 1;
    await db.update(doctors).set({ analytics, updatedAt: new Date() }).where(eq(doctors.id, doc.id));
    doc.analytics = analytics;
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
        isAcceptingBookings: data.isAcceptingBookings ?? true,
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
    const id = parseInt(String(req.params.id));
    const data = req.body;
    const [updated] = await db.update(doctors).set({ ...data, updatedAt: new Date() }).where(eq(doctors.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Doctor not found" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

router.put("/doctors/:id/profile", requireUserAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const data = req.body ?? {};
    const allowed = [
      "name", "qualification", "specialization", "experience", "fee", "hospital",
      "clinicName", "address", "city", "phone", "about", "languages", "availability",
      "timing", "gender", "consultationTypes", "registrationNumber", "avatar",
      "location", "socials", "treatments", "education", "memberships", "insurances",
      "branches", "emergencyAvailable", "isAcceptingBookings",
    ];
    const updates = Object.fromEntries(Object.entries(data).filter(([key]) => allowed.includes(key)));
    const userId = getMedofileUserId(req);
    const [ownedDoctor] = await db.select({ ownerClerkUserId: doctors.ownerClerkUserId }).from(doctors).where(eq(doctors.id, id)).limit(1);
    if (!ownedDoctor || ownedDoctor.ownerClerkUserId !== userId) {
      res.status(403).json({ error: "You can only update your own doctor profile" });
      return;
    }
    const [updated] = await db.update(doctors).set({ ...updates, updatedAt: new Date() }).where(eq(doctors.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Doctor not found" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update doctor profile" });
  }
});

router.delete("/doctors/:id", requireSuperAdmin, async (req, res): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
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
    const events = ["profileViews", "callClicks", "chatClicks", "directionsClicks", "bookings", "impressions"];
    if (!events.includes(event)) { res.status(400).json({ error: "Invalid analytics event" }); return; }
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
