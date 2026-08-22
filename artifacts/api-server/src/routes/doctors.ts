import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookings, doctorReviews, doctors } from "@workspace/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getMedofileUserId, requireAuth, requireSuperAdmin, requireUserAuth } from "../middleware/auth.js";

const router: IRouter = Router();
const reviewAttempts = new Map<string, number>();
type DoctorAnalytics = {
  impressions: number;
  profileViews: number;
  callClicks: number;
  chatClicks: number;
  bookings: number;
  directionsClicks: number;
  weeklyTrend: number[];
};

function distanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDelta = toRadians(lat2 - lat1);
  const lngDelta = toRadians(lng2 - lng1);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(lngDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function doctorDistance(doctor: typeof doctors.$inferSelect, lat: number, lng: number): number | null {
  const location = doctor.location as { lat?: unknown; lng?: unknown } | null;
  const doctorLat = Number(location?.lat);
  const doctorLng = Number(location?.lng);
  return Number.isFinite(doctorLat) && Number.isFinite(doctorLng) && (doctorLat !== 0 || doctorLng !== 0)
    ? distanceInKm(lat, lng, doctorLat, doctorLng)
    : null;
}

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
    const userLat = Number(req.query.lat);
    const userLng = Number(req.query.lng);
    const radiusKm = Math.min(250, Math.max(1, Number(req.query.radiusKm) || 80));
    const radiusKm = Math.min(250, Math.max(1, Number(req.query.radiusKm) || 80));
    const canRankByDistance = Number.isFinite(userLat) && Number.isFinite(userLng);

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
        (!Number.isFinite(maxFee) || doctor.fee <= maxFee) &&
        (!canRankByDistance || (() => {
          const distance = doctorDistance(doctor, userLat, userLng);
          return distance === null || distance <= radiusKm;
        })())
      );
    });
    if (canRankByDistance) {
      result = [...result].sort((left, right) => (doctorDistance(left, userLat, userLng) ?? Infinity) - (doctorDistance(right, userLat, userLng) ?? Infinity));
    }
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

router.get("/doctor-matches", async (req, res): Promise<void> => {
  try {
    const all = await db.select().from(doctors);
    const specializations = String(req.query.specializations ?? "").toLowerCase().split(",").map((value) => value.trim()).filter(Boolean);
    const city = String(req.query.city ?? "").trim().toLowerCase();
    const language = String(req.query.language ?? "").trim().toLowerCase();
    const maxFee = Number(req.query.maxFee);
    const consultationType = String(req.query.consultationType ?? "").trim().toLowerCase();
    const availability = String(req.query.availability ?? "").trim().toLowerCase();
    const userLat = Number(req.query.lat);
    const userLng = Number(req.query.lng);
    const canRankByDistance = Number.isFinite(userLat) && Number.isFinite(userLng);
    const matches = all
      .filter((doctor) => !specializations.length || specializations.some((specialization) => {
        const searchable = [doctor.specialization, ...doctor.treatments, doctor.about].join(" ").toLowerCase();
        return searchable.includes(specialization);
      }))
      .filter((doctor) => !city || doctor.city.toLowerCase().includes(city))
      .filter((doctor) => {
        if (!canRankByDistance) return true;
        const distance = doctorDistance(doctor, userLat, userLng);
        return distance !== null && distance <= radiusKm;
      })
      .map((doctor) => {
      let score = Math.round(doctor.rating * 10);
      const reasons: string[] = [];
      if (specializations.some((specialization) => [doctor.specialization, ...doctor.treatments, doctor.about].join(" ").toLowerCase().includes(specialization))) {
        score += 50; reasons.push(`Matches the care type you described (${doctor.specialization})`);
      }
      if (city && doctor.city.toLowerCase().includes(city)) { score += 20; reasons.push(`Practices in ${doctor.city}`); }
      if (language && doctor.languages.some((item) => item.toLowerCase().includes(language))) { score += 15; reasons.push(`Speaks ${language}`); }
      if (Number.isFinite(maxFee) && doctor.fee <= maxFee) { score += 12; reasons.push(`Within your ₹${maxFee.toLocaleString("en-IN")} budget`); }
      if (consultationType && doctor.consultationTypes.includes(consultationType)) { score += 10; reasons.push(`${consultationType === "home" ? "Home visit" : "In-clinic"} care available`); }
      if (availability === "available" && doctor.isAcceptingBookings) { score += 10; reasons.push("Currently accepting booking requests"); }
      const distance = canRankByDistance ? doctorDistance(doctor, userLat, userLng) : null;
      if (distance !== null) { score += Math.max(0, 30 - Math.round(distance / 4)); reasons.push(`${Math.round(distance)} km from your location`); }
      if (!reasons.length) reasons.push(`Relevant ${doctor.specialization} near you`);
      return { doctor, score, reasons };
    }).sort((left, right) => right.score - left.score).slice(0, 6);
    res.json({ data: matches });
  } catch {
    res.status(500).json({ error: "Unable to find doctor matches" });
  }
});

router.get("/doctors/:id/reviews", async (req, res): Promise<void> => {
  const doctorId = Number(req.params.id);
  const reviews = await db.select().from(doctorReviews).where(and(eq(doctorReviews.doctorId, doctorId), eq(doctorReviews.status, "published"))).orderBy(desc(doctorReviews.createdAt)).limit(40);
  res.json(reviews);
});

router.post("/doctors/:id/reviews", requireUserAuth, async (req, res): Promise<void> => {
  const doctorId = Number(req.params.id);
  const rating = Number(req.body?.rating);
  const authorName = String(req.body?.authorName ?? "").trim();
  const comment = String(req.body?.comment ?? "").trim();
  const bookingId = Number(req.body?.bookingId);
  if (!Number.isInteger(doctorId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || authorName.length < 2 || authorName.length > 80 || comment.length < 20 || comment.length > 1200 || /https?:\/\/|\b\d{10}\b/i.test(comment)) {
    res.status(400).json({ error: "Please provide a respectful review without contact details or links" });
    return;
  }
  const now = Date.now();
  const clientKey = `${req.ip}:${doctorId}`;
  if ((reviewAttempts.get(clientKey) ?? 0) > now - 60_000) {
    res.status(429).json({ error: "Please wait a minute before submitting another review" });
    return;
  }
  reviewAttempts.set(clientKey, now);
  const userId = req.medofileUserId!;
  const [doctor] = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
  const [verifiedBooking] = Number.isInteger(bookingId)
    ? await db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.doctorId, doctorId), eq(bookings.patientClerkUserId, userId), eq(bookings.status, "completed"))).limit(1)
    : [];
  if (!verifiedBooking) {
    res.status(403).json({ error: "Reviews are available after you complete an appointment with this doctor" });
    return;
  }
  const isSuspicious = /\b(cure|guaranteed|fraud|scam|kill|hate)\b/i.test(comment);
  try {
    const [review] = await db.insert(doctorReviews).values({
      doctorId, authorClerkUserId: userId, bookingId: verifiedBooking.id, authorName, rating, comment,
      status: isSuspicious ? "pending" : "published", isVerifiedAppointment: true,
    }).returning();
    if (review!.status === "published") {
      const published = await db.select({ rating: doctorReviews.rating }).from(doctorReviews).where(and(eq(doctorReviews.doctorId, doctorId), eq(doctorReviews.status, "published")));
      const average = published.reduce((total, item) => total + item.rating, 0) / published.length;
      await db.update(doctors).set({ rating: Math.round(average * 10) / 10, reviewCount: published.length, updatedAt: new Date() }).where(eq(doctors.id, doctorId));
    }
    res.status(201).json({ ...review, moderation: review!.status === "pending" ? "Your review is awaiting moderation." : "Your review is now public." });
  } catch {
    res.status(409).json({ error: "A verified appointment can only be reviewed once" });
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
