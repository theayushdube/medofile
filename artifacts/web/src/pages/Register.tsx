import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Stethoscope, UserRound } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Register() {
  const [, navigate] = useLocation();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (role === "doctor") {
      navigate(`/doctor-profile/manage/new?name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}`);
      return;
    }
    localStorage.setItem("medofile_registration", JSON.stringify({ role, name: name.trim(), email: email.trim() }));
    navigate("/doctors");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>
        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
          <p className="text-sm font-semibold text-primary mb-2">Create your Medofile profile</p>
          <h1 className="text-3xl font-bold text-foreground">How will you use Medofile?</h1>
          <p className="text-muted-foreground mt-2">Choose the right experience for your needs. You can update your details later.</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {[
              { value: "patient" as const, icon: UserRound, title: "General user", text: "Find verified doctors, ask the AI assistant, and book appointments." },
              { value: "doctor" as const, icon: Stethoscope, title: "Doctor", text: "Join the network and manage your professional profile and bookings." },
            ].map((item) => {
              const Icon = item.icon;
              const active = role === item.value;
              return (
                <button key={item.value} type="button" onClick={() => setRole(item.value)} className={`relative text-left rounded-2xl border-2 p-5 transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <Icon className={`w-7 h-7 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="font-semibold mt-4 text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.text}</div>
                  {active && <Check className="absolute right-4 top-4 w-5 h-5 text-primary" />}
                </button>
              );
            })}
          </div>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-foreground">Full name
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "doctor" ? "Dr. Your Name" : "Your full name"} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
            <label className="block text-sm font-medium text-foreground">Email <span className="text-muted-foreground font-normal">(optional)</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
            <button className="w-full rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary/90 transition-colors">
              Continue as {role === "doctor" ? "Doctor" : "General User"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}