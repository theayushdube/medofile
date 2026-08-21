import { index, pgTable, serial, text, integer, boolean, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  ownerClerkUserId: text("owner_clerk_user_id").unique(),
  name: text("name").notNull(),
  qualification: text("qualification").notNull(),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull().default(0),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  fee: integer("fee").notNull().default(500),
  hospital: text("hospital").notNull().default(""),
  clinicName: text("clinic_name").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  phone: text("phone").notNull().default(""),
  about: text("about").notNull().default(""),
  languages: jsonb("languages").notNull().default([]).$type<string[]>(),
  availability: text("availability").notNull().default(""),
  timing: text("timing").notNull().default(""),
  isAcceptingBookings: boolean("is_accepting_bookings").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  emergencyAvailable: boolean("emergency_available").notNull().default(false),
  gender: text("gender").notNull().default("Male"),
  consultationTypes: jsonb("consultation_types").notNull().default([]).$type<string[]>(),
  registrationNumber: text("registration_number").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  location: jsonb("location").notNull().default({}).$type<{ lat: number; lng: number; mapsUrl: string }>(),
  socials: jsonb("socials").notNull().default({}).$type<Record<string, string>>(),
  analytics: jsonb("analytics").notNull().default({}).$type<{
    impressions: number; profileViews: number; callClicks: number;
    chatClicks: number; bookings: number; directionsClicks: number;
    weeklyTrend: number[];
  }>(),
  treatments: jsonb("treatments").notNull().default([]).$type<string[]>(),
  education: jsonb("education").notNull().default([]).$type<Array<{ degree: string; college: string; year: number }>>(),
  memberships: jsonb("memberships").notNull().default([]).$type<string[]>(),
  insurances: jsonb("insurances").notNull().default([]).$type<string[]>(),
  branches: jsonb("branches").notNull().default([]).$type<Array<{ name: string; address: string; timing: string }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("doctors_city_idx").on(table.city),
  index("doctors_specialization_idx").on(table.specialization),
  index("doctors_owner_clerk_user_idx").on(table.ownerClerkUserId),
]);

export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, createdAt: true, updatedAt: true });
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
