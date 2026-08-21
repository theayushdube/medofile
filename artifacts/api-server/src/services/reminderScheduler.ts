import { and, eq, lte } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookings, careTimelineEvents, reminderPreferences, scheduledReminders } from "@workspace/db/schema";

type ReminderBooking = { id: number; patientClerkUserId: string | null; doctorId: number; date: string; time: string; status: string };

function appointmentDate(date: string, time: string): Date | null {
  const parsed = new Date(`${date} ${time} GMT+0530`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function scheduleInAppReminder(booking: ReminderBooking): Promise<void> {
  if (!booking.patientClerkUserId || !["upcoming", "pending"].includes(booking.status)) return;
  const [preference] = await db.select().from(reminderPreferences).where(eq(reminderPreferences.patientClerkUserId, booking.patientClerkUserId)).limit(1);
  if (preference && !preference.inApp) return;
  const appointment = appointmentDate(booking.date, booking.time);
  if (!appointment) return;
  const hours = preference?.reminderHours ?? 24;
  const scheduledFor = new Date(Math.max(Date.now(), appointment.getTime() - hours * 60 * 60 * 1000));
  await db.insert(scheduledReminders).values({ bookingId: booking.id, patientClerkUserId: booking.patientClerkUserId, scheduledFor }).onConflictDoUpdate({
    target: scheduledReminders.bookingId,
    set: { scheduledFor, status: "pending", deliveredAt: null },
  });
}

async function deliverDueReminders(): Promise<void> {
  const due = await db.select().from(scheduledReminders).where(and(eq(scheduledReminders.status, "pending"), lte(scheduledReminders.scheduledFor, new Date()))).limit(50);
  for (const reminder of due) {
    const [[booking], [preference]] = await Promise.all([
      db.select().from(bookings).where(eq(bookings.id, reminder.bookingId)).limit(1),
      db.select().from(reminderPreferences).where(eq(reminderPreferences.patientClerkUserId, reminder.patientClerkUserId)).limit(1),
    ]);
    if (!booking || !["upcoming", "pending"].includes(booking.status) || preference?.inApp === false) {
      await db.update(scheduledReminders).set({ status: "skipped" }).where(eq(scheduledReminders.id, reminder.id));
      continue;
    }
    await db.insert(careTimelineEvents).values({
      patientClerkUserId: reminder.patientClerkUserId,
      bookingId: reminder.bookingId,
      type: "appointment_reminder",
      title: "Appointment reminder",
      detail: "You have an upcoming appointment. Check your care space for the latest date and time.",
    });
    await db.update(scheduledReminders).set({ status: "delivered", deliveredAt: new Date() }).where(eq(scheduledReminders.id, reminder.id));
  }
}

export function startReminderScheduler(): void {
  void deliverDueReminders().catch(() => undefined);
  setInterval(() => void deliverDueReminders().catch(() => undefined), 60_000).unref();
}