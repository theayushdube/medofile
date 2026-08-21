import { index, pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id").notNull(),
    patientClerkUserId: text("patient_clerk_user_id"),
    patientName: text("patient_name").notNull(),
    patientEmail: text("patient_email").notNull(),
    patientPhone: text("patient_phone").notNull(),
    patientProblem: text("patient_problem").notNull().default(""),
    date: text("date").notNull(),
    time: text("time").notNull(),
    type: text("type").notNull().default("clinic"),
    branch: text("branch").default(""),
    fee: integer("fee").notNull().default(0),
    status: text("status").notNull().default("upcoming"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_patient_clerk_user_idx").on(table.patientClerkUserId),
    index("bookings_doctor_idx").on(table.doctorId),
  ],
);

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
