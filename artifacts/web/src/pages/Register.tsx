import { useState } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Stethoscope, UserRound } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Register() {
  const [, navigate] = useLocation();
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [name, setName] = useState(user?.fullName || "");
  const [specialization, setSpecialization] = useState("General Physician");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const baseProfile = {
        name: name.trim(),
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: phone.trim(),
        avatar: user.imageUrl || "",
      };
      const profileResponse = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(baseProfile) });
      if (!profileResponse.ok) throw new Error("We could not save your profile.");
      if (role === "doctor") {
        if (!specialization.trim() || !city.trim() || !phone.trim()) throw new Error("Add your specialty, city, and phone number to create a doctor profile.");
        const response = await fetch("/api/doctors/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...baseProfile, specialization: specialization.trim(), city: city.trim(), phone: phone.trim(), consultationTypes: ["clinic"], availability: "By appointment", timing: "Please contact clinic" }),
        });
        if (!response.ok && response.status !== 409) throw new Error("We could not create your doctor profile.");
      }
      navigate("/account");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"><ArrowLeft className="w-4 h-4" /> Back to home</button>
        {!isLoaded ? <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">Loading secure registration…</div> : !user ? (
          <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm text-center">
            <p className="text-sm font-semibold text-primary mb-2">Your Medofile account</p>
            <h1 className="text-3xl font-bold text-foreground">Keep care connected across devices</h1>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Create an optional account to save doctors, track appointments, and manage a professional profile. Browsing stays available without an account.</p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => navigate("/sign-up")} className="rounded-xl bg-primary text-white px-5 py-3 font-semibold hover:bg-primary/90">Create account</button>
              <button onClick={() => navigate("/sign-in")} className="rounded-xl border border-border px-5 py-3 font-semibold text-foreground hover:border-primary">Sign in</button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
            <p className="text-sm font-semibold text-primary mb-2">Set up your Medofile profile</p>
            <h1 className="text-3xl font-bold text-foreground">How will you use Medofile?</h1>
            <p className="text-muted-foreground mt-2">Your browsing remains private. Set up only the care tools you want to use.</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {[
                { value: "patient" as const, icon: UserRound, title: "Patient", text: "Save doctors, keep appointments together, and return to your care history." },
                { value: "doctor" as const, icon: Stethoscope, title: "Doctor", text: "Create your public profile and receive booking insights." },
              ].map((item) => {
                const Icon = item.icon; const active = role === item.value;
                return <button key={item.value} type="button" onClick={() => setRole(item.value)} className={`relative text-left rounded-2xl border-2 p-5 transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}><Icon className={`w-7 h-7 ${active ? "text-primary" : "text-muted-foreground"}`} /><div className="font-semibold mt-4 text-foreground">{item.title}</div><div className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.text}</div>{active && <Check className="absolute right-4 top-4 w-5 h-5 text-primary" />}</button>;
              })}
            </div>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-foreground">Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "doctor" ? "Dr. Your Name" : "Your full name"} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" /></label>
              <label className="block text-sm font-medium text-foreground">Email<input disabled value={user.primaryEmailAddress?.emailAddress || ""} className="mt-2 w-full rounded-xl border border-border bg-muted px-4 py-3 text-muted-foreground" /></label>
              {(role === "doctor" || phone) && <label className="block text-sm font-medium text-foreground">Phone {role === "doctor" && <span className="text-destructive">*</span>}<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" /></label>}
              {role === "doctor" && <div className="grid sm:grid-cols-2 gap-4"><label className="block text-sm font-medium text-foreground">Specialty<input required value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" /></label><label className="block text-sm font-medium text-foreground">City<input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" /></label></div>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button disabled={submitting} className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">{submitting ? "Saving…" : `Continue as ${role === "doctor" ? "Doctor" : "Patient"}`}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}