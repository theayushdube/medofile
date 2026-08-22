import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { BellRing, Bookmark, CalendarDays, CheckCircle2, Clock3, FileText, LogOut, Stethoscope, UserRound } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import type { WebDoctor } from "@/hooks/useDoctors";

type Booking = {
  id: number;
  patientName?: string;
  date: string;
  time: string;
  status: string;
  type: string;
  doctor: WebDoctor;
};

type AccountData = {
  profile: { name: string; email: string; phone: string } | null;
  role: "patient" | "doctor";
  doctorId: number | null;
};

type TimelineData = {
  events: Array<{ id: number; type: string; title: string; detail: string; createdAt: string }>;
  documents: Array<{ id: number; kind: string; title: string; note: string; fileUrl: string; createdAt: string }>;
  followUps: Array<{ id: number; instructions: string; createdAt: string; doctor: WebDoctor }>;
};
type ReminderPreferences = { inApp: boolean; email: boolean; push: boolean; whatsapp: boolean; reminderHours: number };

type DoctorWorkspace = {
  doctor: WebDoctor;
  analytics: WebDoctor["analytics"];
  bookings: Booking[];
  summary: { total: number; pending: number; completed: number; conversionRate: number; profileCompleteness: number };
  nextActions: string[];
};

export default function Account() {
  const [, navigate] = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [saved, setSaved] = useState<WebDoctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workspace, setWorkspace] = useState<DoctorWorkspace | null>(null);
  const [timeline, setTimeline] = useState<TimelineData>({ events: [], documents: [], followUps: [] });
  const [reminders, setReminders] = useState<ReminderPreferences | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentNote, setDocumentNote] = useState("");
  const [documentKind, setDocumentKind] = useState<"report" | "prescription">("report");
  const [actionBusy, setActionBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate("/sign-in");
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch("/api/me").then((response) => response.ok ? response.json() : null),
      fetch("/api/me/saved-doctors").then((response) => response.ok ? response.json() : []),
      fetch("/api/me/bookings").then((response) => response.ok ? response.json() : []),
      fetch("/api/me/timeline").then((response) => response.ok ? response.json() : { events: [], documents: [], followUps: [] }),
      fetch("/api/me/reminder-preferences").then((response) => response.ok ? response.json() : null),
    ])
      .then(async ([nextAccount, nextSaved, nextBookings, nextTimeline, nextReminders]) => {
        if (!nextAccount || cancelled) return;
        setAccount(nextAccount);
        setSaved(nextSaved);
        setBookings(nextBookings);
        setTimeline(nextTimeline);
        setReminders(nextReminders);
        if (nextAccount.role === "doctor") {
          const response = await fetch("/api/me/doctor/dashboard");
          if (response.ok && !cancelled) setWorkspace(await response.json());
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [isLoaded, navigate, user]);

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">Loading your care space…</div></div>;
  }

  const upcoming = bookings.filter((booking) => booking.status === "upcoming" || booking.status === "pending");
  const history = bookings.filter((booking) => booking.status === "completed" || booking.status === "cancelled");
  const patientName = account?.profile?.name || user?.fullName || "Medofile member";

  async function changeBooking(id: number, action: "cancel" | "reschedule") {
    let body: string | undefined;
    if (action === "reschedule") {
      const date = window.prompt("New appointment date (for example, 2026-08-25):");
      const time = date ? window.prompt("New appointment time (for example, 10:30 AM):") : null;
      if (!date || !time) return;
      body = JSON.stringify({ date, time });
    }
    setActionBusy(id);
    try {
      const response = await fetch(`/api/me/bookings/${id}/${action}`, {
        method: action === "cancel" ? "POST" : "PUT",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      if (!response.ok) throw new Error();
      const changed = await response.json();
      setBookings((previous) => previous.map((booking) => booking.id === id ? { ...booking, ...changed } : booking));
      setTimeline((previous) => ({ ...previous, events: [{ id: Date.now(), type: `appointment_${action}led`, title: `Appointment ${action}d`, detail: action === "cancel" ? "This appointment was cancelled." : `New time: ${changed.date} at ${changed.time}`, createdAt: new Date().toISOString() }, ...previous.events] }));
    } catch {
      window.alert("We could not update this appointment. Please try again.");
    } finally { setActionBusy(null); }
  }

  async function saveDocument(event: React.FormEvent) {
    event.preventDefault();
    if (!documentTitle.trim()) return;
    const response = await fetch("/api/me/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: documentKind, title: documentTitle, note: documentNote }) });
    if (!response.ok) { window.alert("We could not save this care record."); return; }
    const document = await response.json();
    setTimeline((previous) => ({ ...previous, documents: [document, ...previous.documents] }));
    setDocumentTitle(""); setDocumentNote("");
  }

  async function updateReminders(updates: Partial<ReminderPreferences>) {
    if (!reminders) return;
    const optimistic = { ...reminders, ...updates };
    setReminders(optimistic);
    const response = await fetch("/api/me/reminder-preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    if (!response.ok) setReminders(reminders);
    else setReminders(await response.json());
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <section className="rounded-3xl bg-gradient-to-br from-[#08377d] via-[#0a56b7] to-[#129f9e] text-white p-6 md:p-9 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-sm text-white/70 font-medium">Your connected care space</p>
              <h1 className="text-3xl font-bold mt-1">Welcome back, {patientName.split(" ")[0]}</h1>
              <p className="text-white/80 text-sm mt-2">Keep your doctors, appointments, and care activity together.</p>
            </div>
            <button onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-semibold transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </section>

        {account?.role === "doctor" && workspace ? <><div className="flex justify-end mb-4"><button onClick={() => navigate(`/doctor-profile/manage/${workspace.doctor.id}`)} className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">Manage public profile</button></div><DoctorWorkspace workspace={workspace} /></> : (
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              <CareList title="Upcoming appointments" icon={<CalendarDays className="w-5 h-5 text-primary" />} items={upcoming} empty="No upcoming appointments yet. Find a doctor when you are ready." onBrowse={() => navigate("/doctors")} onCancel={(id) => changeBooking(id, "cancel")} onReschedule={(id) => changeBooking(id, "reschedule")} busyId={actionBusy} />
              <CareList title="Care history" icon={<Clock3 className="w-5 h-5 text-primary" />} items={history} empty="Completed or cancelled appointments will appear here." onBrowse={() => navigate("/doctors")} />
              <CareTimeline timeline={timeline} />
            </section>
            <aside className="space-y-6">
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><Bookmark className="w-4 h-4 text-primary" /> Saved doctors</h2>
                {saved.length ? <div className="mt-4 space-y-3">{saved.slice(0, 4).map((doctor) => <button key={doctor.id} onClick={() => navigate(`/doctors/${doctor.id}`)} className="w-full flex gap-3 text-left hover:bg-muted rounded-xl p-2 -mx-2 transition-colors"><img src={doctor.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" /><span><span className="block text-sm font-semibold text-foreground">{doctor.name}</span><span className="block text-xs text-muted-foreground">{doctor.specialization}</span></span></button>)}</div> : <EmptyCard icon={<Bookmark className="w-5 h-5" />} text="Save trusted doctors to revisit them here." action="Browse doctors" onClick={() => navigate("/doctors")} />}
              </section>
              <section className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><UserRound className="w-4 h-4 text-primary" /> Your account</h2>
                <p className="text-sm text-muted-foreground mt-2">{account?.profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
                <button onClick={() => navigate("/register")} className="text-sm font-semibold text-primary mt-4 hover:underline">Update care details</button>
              </section>
              <ReminderSettings preferences={reminders} onChange={updateReminders} />
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Add a care record</h2>
                <p className="text-xs text-muted-foreground mt-2">Save a short note for a prescription or report to keep your timeline organized. File upload is coming soon.</p>
                <form onSubmit={saveDocument} className="mt-3 space-y-2">
                  <select value={documentKind} onChange={(event) => setDocumentKind(event.target.value as "report" | "prescription")} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"><option value="report">Health report</option><option value="prescription">Prescription</option></select>
                  <input value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} placeholder="Title, e.g. Blood test — August" maxLength={120} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                  <textarea value={documentNote} onChange={(event) => setDocumentNote(event.target.value)} placeholder="Optional note" maxLength={1000} className="w-full rounded-lg border border-border px-3 py-2 text-sm min-h-20" />
                  <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-2 hover:bg-primary/90">Save to timeline</button>
                </form>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function CareList({ title, icon, items, empty, onBrowse, onCancel, onReschedule, busyId }: { title: string; icon: React.ReactNode; items: Booking[]; empty: string; onBrowse: () => void; onCancel?: (id: number) => void; onReschedule?: (id: number) => void; busyId?: number | null }) {
  return <section className="bg-white border border-border rounded-2xl p-5 md:p-6"><h2 className="font-semibold text-foreground flex items-center gap-2">{icon}{title}</h2>{items.length ? <div className="mt-4 divide-y divide-border">{items.map((booking) => <div key={booking.id} className="py-4 flex gap-3"><img src={booking.doctor.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" /><div className="flex-1"><div className="font-semibold text-sm text-foreground">{booking.doctor.name}</div><div className="text-xs text-muted-foreground mt-0.5">{booking.doctor.specialization} · {booking.type === "home" ? "Home visit" : "In-clinic"}</div><div className="text-sm text-primary font-medium mt-2">{booking.date} · {booking.time}</div>{onCancel && <div className="flex gap-3 mt-2"><button disabled={busyId === booking.id} onClick={() => onReschedule?.(booking.id)} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">Reschedule</button><button disabled={busyId === booking.id} onClick={() => onCancel(booking.id)} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">Cancel</button></div>}</div><span className="h-fit text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">{booking.status}</span></div>)}</div> : <EmptyCard icon={<CalendarDays className="w-5 h-5" />} text={empty} action="Find care" onClick={onBrowse} />}</section>;
}

function CareTimeline({ timeline }: { timeline: TimelineData }) {
  const items = [...timeline.events, ...timeline.documents.map((document) => ({ id: -document.id, title: document.title, detail: document.note || (document.kind === "report" ? "Health report" : "Prescription"), createdAt: document.createdAt }))].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return <section className="bg-white border border-border rounded-2xl p-5 md:p-6"><h2 className="font-semibold text-foreground flex items-center gap-2"><Clock3 className="w-5 h-5 text-primary" /> Your care timeline</h2>{timeline.followUps.length > 0 && <div className="mt-4 space-y-3">{timeline.followUps.map((followUp) => <div key={followUp.id} className="rounded-xl bg-teal-50 border border-teal-100 p-3"><p className="text-sm font-semibold text-teal-900">Care instructions from {followUp.doctor.name}</p><p className="text-sm text-teal-800 mt-1 whitespace-pre-wrap">{followUp.instructions}</p></div>)}</div>}{items.length ? <div className="mt-4 space-y-3">{items.slice(0, 12).map((item) => <div key={item.id} className="border-l-2 border-primary/25 pl-3"><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="text-xs text-muted-foreground mt-1">{item.detail}</p><p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>)}</div> : <p className="text-sm text-muted-foreground mt-4">Bookings, care instructions, records, and saved AI summaries will appear here.</p>}</section>;
}

function ReminderSettings({ preferences, onChange }: { preferences: ReminderPreferences | null; onChange: (updates: Partial<ReminderPreferences>) => void }) {
  if (!preferences) return null;
  const choices: Array<[keyof Pick<ReminderPreferences, "inApp" | "email" | "push" | "whatsapp">, string]> = [["inApp", "In-app"], ["email", "Email"], ["push", "Push"], ["whatsapp", "WhatsApp"]];
  return <section className="bg-white border border-border rounded-2xl p-5"><h2 className="font-semibold text-foreground flex items-center gap-2"><BellRing className="w-4 h-4 text-primary" /> Appointment reminders</h2><p className="text-xs text-muted-foreground mt-2">Only channels connected to your device or account can deliver messages.</p><div className="mt-3 space-y-2">{choices.map(([key, label]) => <label key={key} className="flex justify-between text-sm text-foreground"><span>{label}</span><input type="checkbox" checked={preferences[key]} onChange={(event) => onChange({ [key]: event.target.checked })} /></label>)}</div><label className="block text-xs text-muted-foreground mt-4">Remind me<select value={preferences.reminderHours} onChange={(event) => onChange({ reminderHours: Number(event.target.value) })} className="block mt-1 w-full rounded-lg border border-border bg-white px-2 py-2 text-sm text-foreground"><option value={1}>1 hour before</option><option value={24}>24 hours before</option><option value={48}>2 days before</option></select></label></section>;
}

function EmptyCard({ icon, text, action, onClick }: { icon: React.ReactNode; text: string; action: string; onClick: () => void }) {
  return <div className="text-center py-8 text-muted-foreground"><div className="mx-auto w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">{icon}</div><p className="text-sm">{text}</p><button onClick={onClick} className="text-sm font-semibold text-primary mt-3 hover:underline">{action}</button></div>;
}

function DoctorWorkspace({ workspace }: { workspace: DoctorWorkspace }) {
  const { doctor, analytics, summary, bookings, nextActions } = workspace;
  const [followUpFor, setFollowUpFor] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [completedBookingIds, setCompletedBookingIds] = useState<number[]>([]);
  async function completeBooking(bookingId: number) {
    const response = await fetch(`/api/me/doctor/bookings/${bookingId}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
    if (!response.ok) { window.alert("The appointment could not be marked complete."); return; }
    setCompletedBookingIds((ids) => [...ids, bookingId]);
  }
  async function saveFollowUp() {
    if (!followUpFor || instructions.trim().length < 10) return;
    setSaving(true);
    const response = await fetch(`/api/me/doctor/bookings/${followUpFor}/follow-up`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instructions }) });
    setSaving(false);
    if (!response.ok) { window.alert("Care instructions could not be saved. The appointment must belong to a signed-in patient."); return; }
    setFollowUpFor(null); setInstructions("");
  }
  return <div className="space-y-6"><section className="bg-white border border-border rounded-2xl p-6"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Doctor workspace</p><h2 className="text-2xl font-bold text-foreground mt-1">{doctor.name}</h2><p className="text-sm text-muted-foreground mt-1">{doctor.isAcceptingBookings ? "Accepting new booking requests" : "Bookings are currently paused"}</p></div><span className={`inline-flex w-fit items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${doctor.isAcceptingBookings ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}><CheckCircle2 className="w-4 h-4" /> {doctor.isAcceptingBookings ? "Available" : "Paused"}</span></div></section><section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[{ label: "Profile completion", value: `${summary.profileCompleteness}%` }, { label: "Profile views", value: analytics.profileViews.toLocaleString() }, { label: "Booking requests", value: String(summary.total) }, { label: "View to booking", value: `${summary.conversionRate}%` }].map((metric) => <div key={metric.label} className="bg-white border border-border rounded-2xl p-5"><div className="text-2xl font-bold text-primary">{metric.value}</div><div className="text-sm text-muted-foreground mt-1">{metric.label}</div></div>)}</section><div className="grid lg:grid-cols-3 gap-6"><section className="lg:col-span-2 bg-white border border-border rounded-2xl p-6"><h3 className="font-semibold text-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Recent booking leads</h3>{bookings.length ? <div className="mt-4 space-y-3">{bookings.slice(0, 5).map((booking) => { const complete = booking.status === "completed" || completedBookingIds.includes(booking.id); return <div key={booking.id} className="p-3 bg-muted rounded-xl"><div className="flex justify-between gap-3"><div><div className="font-semibold text-sm text-foreground">{booking.patientName}</div><div className="text-xs text-muted-foreground mt-0.5">{booking.date} · {booking.time} · {booking.type === "home" ? "Home visit" : "In-clinic"}</div></div><span className="capitalize text-xs font-semibold text-primary">{complete ? "completed" : booking.status}</span></div>{!complete ? <button onClick={() => void completeBooking(booking.id)} className="text-xs font-semibold text-primary mt-3 hover:underline">Mark appointment completed</button> : <button onClick={() => { setFollowUpFor(booking.id); setInstructions(""); }} className="text-xs font-semibold text-primary mt-3 hover:underline">Add care instructions</button>}{followUpFor === booking.id && <div className="mt-3"><textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Follow-up guidance for this patient (10–2,000 characters)" maxLength={2000} className="w-full rounded-lg border border-border px-3 py-2 text-sm min-h-24" /><div className="flex gap-3 mt-2"><button disabled={saving || instructions.trim().length < 10} onClick={saveFollowUp} className="rounded-lg bg-primary text-white px-3 py-2 text-xs font-semibold disabled:opacity-50">{saving ? "Saving…" : "Send to care timeline"}</button><button onClick={() => setFollowUpFor(null)} className="text-xs font-semibold text-muted-foreground">Cancel</button></div></div>}</div>; })}</div> : <EmptyCard icon={<Stethoscope className="w-5 h-5" />} text="Booking leads will appear when patients contact you." action="Complete profile" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />}</section><aside className="bg-primary/5 border border-primary/15 rounded-2xl p-6"><h3 className="font-semibold text-foreground">Growth next steps</h3><div className="mt-4 space-y-3">{nextActions.length ? nextActions.map((action) => <p key={action} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">•</span>{action}</p>) : <p className="text-sm text-muted-foreground">Your public profile is ready. Keep your availability up to date to earn patient trust.</p>}</div></aside></div></div>;
}