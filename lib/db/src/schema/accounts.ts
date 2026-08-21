import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A small, app-owned projection of a Clerk identity. Authentication remains in
 * Clerk; this table holds only product profile data that Medofile needs.
 */
export const patientProfiles = pgTable(
  "patient_profiles",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    avatar: text("avatar").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("patient_profiles_clerk_user_idx").on(table.clerkUserId)],
);

export const savedDoctors = pgTable(
  "saved_doctors",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    doctorId: integer("doctor_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("saved_doctors_user_doctor_unique").on(table.clerkUserId, table.doctorId),
    index("saved_doctors_user_idx").on(table.clerkUserId),
    index("saved_doctors_doctor_idx").on(table.doctorId),
  ],
);

export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSavedDoctorSchema = createInsertSchema(savedDoctors).omit({ id: true, createdAt: true });

export type PatientProfile = typeof patientProfiles.$inferSelect;
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;
export type SavedDoctor = typeof savedDoctors.$inferSelect;
export type InsertSavedDoctor = z.infer<typeof insertSavedDoctorSchema>;