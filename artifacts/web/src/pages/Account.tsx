import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { Bookmark, CalendarDays, CheckCircle2, Clock3, LogOut, Stethoscope, UserRound } from "lucide-react";
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
    ])
      .then(async ([nextAccount, nextSaved, nextBookings]) => {
        if (!nextAccount || cancelled) return;
        setAccount(nextAccount);
        setSaved(nextSaved);
        setBookings(nextBookings);
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

        {account?.role === "doctor" && workspace ? <DoctorWorkspace workspace={workspace} /> : (
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              <CareList title="Upcoming appointments" icon={<CalendarDays className="w-5 h-5 text-primary" />} items={upcoming} empty="No upcoming appointments yet. Find a doctor when you are ready." onBrowse={() => navigate("/doctors")} />
              <CareList title="Care history" icon={<Clock3 className="w-5 h-5 text-primary" />} items={history} empty="Completed or cancelled appointments will appear here." onBrowse={() => navigate("/doctors")} />
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
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function CareList({ title, icon, items, empty, onBrowse }: { title: string; icon: React.ReactNode; items: Booking[]; empty: string; onBrowse: () => void }) {
  return <section className="bg-white border border-border rounded-2xl p-5 md:p-6"><h2 className="font-semibold text-foreground flex items-center gap-2">{icon}{title}</h2>{items.length ? <div className="mt-4 divide-y divide-border">{items.map((booking) => <div key={booking.id} className="py-4 flex gap-3"><img src={booking.doctor.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" /><div className="flex-1"><div className="font-semibold text-sm text-foreground">{booking.doctor.name}</div><div className="text-xs text-muted-foreground mt-0.5">{booking.doctor.specialization} · {booking.type === "home" ? "Home visit" : "In-clinic"}</div><div className="text-sm text-primary font-medium mt-2">{booking.date} · {booking.time}</div></div><span className="h-fit text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">{booking.status}</span></div>)}</div> : <EmptyCard icon={<CalendarDays className="w-5 h-5" />} text={empty} action="Find care" onClick={onBrowse} />}</section>;
}

function EmptyCard({ icon, text, action, onClick }: { icon: React.ReactNode; text: string; action: string; onClick: () => void }) {
  return <div className="text-center py-8 text-muted-foreground"><div className="mx-auto w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">{icon}</div><p className="text-sm">{text}</p><button onClick={onClick} className="text-sm font-semibold text-primary mt-3 hover:underline">{action}</button></div>;
}

function DoctorWorkspace({ workspace }: { workspace: DoctorWorkspace }) {
  const { doctor, analytics, summary, bookings, nextActions } = workspace;
  return <div className="space-y-6"><section className="bg-white border border-border rounded-2xl p-6"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Doctor workspace</p><h2 className="text-2xl font-bold text-foreground mt-1">{doctor.name}</h2><p className="text-sm text-muted-foreground mt-1">{doctor.isAcceptingBookings ? "Accepting new booking requests" : "Bookings are currently paused"}</p></div><span className={`inline-flex w-fit items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${doctor.isAcceptingBookings ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}><CheckCircle2 className="w-4 h-4" /> {doctor.isAcceptingBookings ? "Available" : "Paused"}</span></div></section><section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[{ label: "Profile completion", value: `${summary.profileCompleteness}%` }, { label: "Profile views", value: analytics.profileViews.toLocaleString() }, { label: "Booking requests", value: String(summary.total) }, { label: "View to booking", value: `${summary.conversionRate}%` }].map((metric) => <div key={metric.label} className="bg-white border border-border rounded-2xl p-5"><div className="text-2xl font-bold text-primary">{metric.value}</div><div className="text-sm text-muted-foreground mt-1">{metric.label}</div></div>)}</section><div className="grid lg:grid-cols-3 gap-6"><section className="lg:col-span-2 bg-white border border-border rounded-2xl p-6"><h3 className="font-semibold text-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Recent booking leads</h3>{bookings.length ? <div className="mt-4 space-y-3">{bookings.slice(0, 5).map((booking) => <div key={booking.id} className="flex justify-between gap-3 p-3 bg-muted rounded-xl"><div><div className="font-semibold text-sm text-foreground">{booking.patientName}</div><div className="text-xs text-muted-foreground mt-0.5">{booking.date} · {booking.time} · {booking.type === "home" ? "Home visit" : "In-clinic"}</div></div><span className="capitalize text-xs font-semibold text-primary">{booking.status}</span></div>)}</div> : <EmptyCard icon={<Stethoscope className="w-5 h-5" />} text="Booking leads will appear when patients contact you." action="Complete profile" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />}</section><aside className="bg-primary/5 border border-primary/15 rounded-2xl p-6"><h3 className="font-semibold text-foreground">Growth next steps</h3><div className="mt-4 space-y-3">{nextActions.length ? nextActions.map((action) => <p key={action} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">•</span>{action}</p>) : <p className="text-sm text-muted-foreground">Your public profile is ready. Keep your availability up to date to earn patient trust.</p>}</div></aside></div></div>;
}