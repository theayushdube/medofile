import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const careTimelineEvents = pgTable(
  "care_timeline_events",
  {
    id: serial("id").primaryKey(),
    patientClerkUserId: text("patient_clerk_user_id").notNull(),
    bookingId: integer("booking_id"),
    doctorId: integer("doctor_id"),
    type: text("type").notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),
    metadata: jsonb("metadata").notNull().default({}).$type<Record<string, string | number | boolean>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("care_timeline_patient_created_idx").on(table.patientClerkUserId, table.createdAt),
    index("care_timeline_booking_idx").on(table.bookingId),
  ],
);

export const careDocuments = pgTable(
  "care_documents",
  {
    id: serial("id").primaryKey(),
    patientClerkUserId: text("patient_clerk_user_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    note: text("note").notNull().default(""),
    fileUrl: text("file_url").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("care_documents_patient_created_idx").on(table.patientClerkUserId, table.createdAt)],
);

export const doctorFollowUps = pgTable(
  "doctor_follow_ups",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").notNull(),
    doctorId: integer("doctor_id").notNull(),
    patientClerkUserId: text("patient_clerk_user_id").notNull(),
    instructions: text("instructions").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("doctor_followups_booking_unique").on(table.bookingId),
    index("doctor_followups_patient_idx").on(table.patientClerkUserId),
  ],
);

export const doctorReviews = pgTable(
  "doctor_reviews",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id").notNull(),
    authorClerkUserId: text("author_clerk_user_id"),
    bookingId: integer("booking_id"),
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    status: text("status").notNull().default("published"),
    isVerifiedAppointment: boolean("is_verified_appointment").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("doctor_reviews_doctor_published_idx").on(table.doctorId, table.status, table.createdAt),
    uniqueIndex("doctor_reviews_verified_booking_unique").on(table.bookingId),
  ],
);

export const reminderPreferences = pgTable(
  "reminder_preferences",
  {
    id: serial("id").primaryKey(),
    patientClerkUserId: text("patient_clerk_user_id").notNull(),
    inApp: boolean("in_app").notNull().default(true),
    email: boolean("email").notNull().default(true),
    push: boolean("push").notNull().default(false),
    whatsapp: boolean("whatsapp").notNull().default(false),
    reminderHours: integer("reminder_hours").notNull().default(24),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("reminder_preferences_patient_unique").on(table.patientClerkUserId)],
);

export const scheduledReminders = pgTable(
  "scheduled_reminders",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").notNull(),
    patientClerkUserId: text("patient_clerk_user_id").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("pending"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("scheduled_reminders_booking_unique").on(table.bookingId),
    index("scheduled_reminders_due_idx").on(table.status, table.scheduledFor),
  ],
);

export const insertCareDocumentSchema = createInsertSchema(careDocuments).omit({ id: true, createdAt: true, patientClerkUserId: true });
export type CareDocument = typeof careDocuments.$inferSelect;
export type InsertCareDocument = z.infer<typeof insertCareDocumentSchema>;