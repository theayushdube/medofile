import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Search, ChevronDown, Sparkles, ArrowRight, CheckCircle, LocateFixed, Activity,
  BadgeCheck, CalendarDays, HeartPulse, Home as HomeIcon, FlaskConical, Siren,
  ShieldCheck, Stethoscope, UsersRound, Brain, Baby, Bone, Eye, MousePointer2,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { SPECIALIZATIONS } from "@/data/doctors";
import { useDoctors } from "@/hooks/useDoctors";
import { Navbar } from "@/components/Navbar";
import { DoctorCard } from "@/components/DoctorCard";

const CITIES = ["New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Kolkata", "Gurugram", "Chennai", "Pune"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "New Delhi": { lat: 28.6, lng: 77.2 }, "Mumbai": { lat: 19.07, lng: 72.87 },
  "Bengaluru": { lat: 12.97, lng: 77.59 }, "Hyderabad": { lat: 17.38, lng: 78.48 },
  "Kolkata": { lat: 22.57, lng: 88.36 }, "Gurugram": { lat: 28.46, lng: 77.03 },
  "Chennai": { lat: 13.08, lng: 80.27 }, "Pune": { lat: 18.52, lng: 73.86 },
};

function nearestCity(lat: number, lng: number): string {
  let best = "All Cities"; let bestDist = Infinity;
  for (const [name, c] of Object.entries(CITY_COORDS)) {
    const d = Math.hypot(lat - c.lat, lng - c.lng);
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return bestDist < 3 ? best : "All Cities";
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger: Variants = { show: { transition: { staggerChildren: 0.07 } } };
const fadeIn: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } };

export default function Home() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [locating, setLocating] = useState(false);
  const [heroMode, setHeroMode] = useState<"patient" | "doctor">("patient");
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const { doctors } = useDoctors();

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCity(nearestCity(pos.coords.latitude, pos.coords.longitude)); setLocating(false); },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
      const matchCity = city === "All Cities" || d.city === city;
      const matchSpec = !selectedSpec || d.specialization === selectedSpec;
      return matchSearch && matchCity && matchSpec;
    });
  }, [search, city, selectedSpec, doctors]);

  const showFiltered = !!(search || selectedSpec || city !== "All Cities");
  const specialtyIcons = [HeartPulse, Brain, Baby, Bone, Eye, Stethoscope];
  const heroContent = heroMode === "patient"
    ? {
        eyebrow: "India's connected care network",
        title: "Care that feels closer.",
        description: "Find trusted doctors, understand your symptoms with AI, and book care that fits your life — all in one calm, connected place.",
        action: "Find my doctor",
      }
    : {
        eyebrow: "Built for doctors who care",
        title: "Grow a practice people trust.",
        description: "Turn your expertise into a stronger digital presence with verified profiles, qualified patient leads, and a booking experience that works around you.",
        action: "Join Medofile",
      };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#071A3A] text-white">
        <div className="absolute inset-0 pointer-events-none hero-grid" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-20 w-[30rem] h-[30rem] rounded-full bg-primary/30 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-48 right-0 w-[34rem] h-[34rem] rounded-full bg-[#00C897]/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="grid lg:grid-cols-[1.02fr_.98fr] gap-10 lg:gap-6 items-center">
            <motion.div className="max-w-2xl" variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8FE8D2] font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00C897] shadow-[0_0_0_5px_rgba(0,200,151,.12)]" />
                {heroContent.eyebrow}
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-semibold leading-[.98] tracking-[-0.055em] mb-6 max-w-xl">
                {heroContent.title}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-white/65 text-base md:text-lg max-w-xl mb-7 leading-relaxed">
                {heroContent.description}
              </motion.p>
              <motion.div variants={fadeUp} className="inline-flex p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-7">
                <button onClick={() => setHeroMode("patient")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${heroMode === "patient" ? "bg-white text-[#09214A] shadow-lg" : "text-white/65 hover:text-white"}`}>
                  I need care
                </button>
                <button onClick={() => setHeroMode("doctor")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${heroMode === "doctor" ? "bg-[#00C897] text-[#042B2A] shadow-lg" : "text-white/65 hover:text-white"}`}>
                  I am a doctor
                </button>
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                {[
                  { icon: BadgeCheck, label: "Verified specialists" },
                  { icon: CalendarDays, label: "Simple booking" },
                  { icon: ShieldCheck, label: "Care you can trust" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#00C897]" /> {label}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative min-h-[390px] lg:min-h-[480px] hidden sm:block"
              initial={{ opacity: 0, scale: .94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: .8, delay: .15, ease: "easeOut" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHeroTilt({ x: ((e.clientY - rect.top) / rect.height - .5) * -7, y: ((e.clientX - rect.left) / rect.width - .5) * 7 });
              }}
              onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
            >
              <div className="absolute inset-4 md:inset-8 rounded-[2.5rem] bg-gradient-to-br from-white/[.16] to-white/[.03] border border-white/15 shadow-2xl backdrop-blur-[2px] overflow-hidden hero-orbit">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,200,151,.28),transparent_34%)]" />
                <div className="absolute top-10 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <motion.div className="absolute inset-[15%] rounded-full border border-white/15" animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-[28%] rounded-full border border-[#00C897]/25" animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 900 }}>
                  <motion.div animate={{ rotateX: heroTilt.x, rotateY: heroTilt.y }} transition={{ type: "spring", stiffness: 120, damping: 16 }} className="relative w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-[#1B72E8] to-[#00C897] shadow-[0_24px_80px_rgba(0,200,151,.28)] flex items-center justify-center border border-white/30" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute -inset-3 rounded-[2.8rem] border border-white/15" />
                    <img src="/brand-mark.svg" alt="" className="w-24 h-24 rounded-[1.5rem] shadow-xl" />
                  </motion.div>
                </div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-12 right-8 md:right-12 glass-float">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-[#00C897]/15 flex items-center justify-center"><BadgeCheck className="w-4 h-4 text-[#72F1D0]" /></div><div><div className="text-xs text-white/50">Network</div><div className="text-sm font-semibold">Verified care</div></div></div>
                </motion.div>
                <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: .5 }} className="absolute bottom-14 left-7 md:left-12 glass-float">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-[#1B72E8]/25 flex items-center justify-center"><Activity className="w-4 h-4 text-[#A8D4FF]" /></div><div><div className="text-xs text-white/50">Patient first</div><div className="text-sm font-semibold">Care in motion</div></div></div>
                </motion.div>
                <div className="absolute bottom-9 right-8 text-[10px] uppercase tracking-[.18em] text-white/35">Move your cursor</div>
              </div>
            </motion.div>
          </div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-4 bg-white/[.98] rounded-[1.35rem] shadow-2xl shadow-black/20 p-2.5 flex flex-col sm:flex-row gap-2 max-w-5xl border border-white/30"
          >
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-[#F3F7FC] border border-[#E3EBF5]">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <input
                className="flex-1 bg-transparent text-[#0D1B2A] placeholder-[#8291A7] text-sm outline-none"
                placeholder={heroMode === "doctor" ? "Search your specialty or city..." : "Search a doctor, specialty, or symptom..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 sm:w-52">
              <button title="Detect my location" onClick={detectLocation} disabled={locating}
                className="shrink-0 hover:text-primary transition-colors disabled:opacity-50">
                <LocateFixed className={`w-4 h-4 ${locating ? "animate-pulse text-primary" : "text-[#8291A7]"}`} />
              </button>
              <select className="flex-1 bg-transparent text-gray-700 text-sm outline-none cursor-pointer"
                value={city} onChange={(e) => setCity(e.target.value)}>
                <option>All Cities</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <button
              className="bg-[#0D1B2A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary active:scale-95 transition-all shrink-0 inline-flex items-center justify-center gap-2"
              onClick={() => navigate(`/doctors?q=${encodeURIComponent(search)}&city=${encodeURIComponent(city)}`)}
            >
              {heroContent.action} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="hsl(213, 33%, 97%)" />
          </svg>
        </div>
      </section>

      {/* Stats Strip */}
      <motion.section
        className="bg-white/80 backdrop-blur border-b border-border"
        initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "1,000+", label: "Verified Doctors", icon: Stethoscope },
            { value: "50,000+", label: "Patients supported", icon: UsersRound },
            { value: "20+", label: "Cities covered", icon: LocateFixed },
            { value: "4.8", label: "Average rating", icon: ShieldCheck },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-secondary text-primary flex items-center justify-center"><s.icon className="w-5 h-5" /></span>
              <div>
                <div className="text-xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* AI Health Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[#00C897] text-white p-6 mb-10 cursor-pointer"
          onClick={() => navigate("/healthbot")}
        >
          <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10 pointer-events-none">
            <div className="w-full h-full bg-white rounded-full transform translate-x-1/2 -translate-y-1/4" />
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="font-bold text-lg">AI Health Assistant</div>
              <div className="text-white/80 text-sm mt-0.5">Describe your symptoms and get instant doctor suggestions powered by AI</div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2.5 font-medium text-sm">
              Try Now <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Browse by Specialty */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-5">Browse by Specialty</motion.h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedSpec("")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                !selectedSpec ? "border-primary bg-secondary text-primary" : "border-border bg-white text-foreground hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">🔭</span>
              <span className="text-xs font-medium text-center leading-tight">All</span>
            </motion.button>
            {SPECIALIZATIONS.map((sp) => (
              <motion.button
                key={sp.id}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedSpec(selectedSpec === sp.name ? "" : sp.name)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedSpec === sp.name ? "border-primary bg-secondary text-primary" : "border-border bg-white text-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{sp.emoji}</span>
                <span className="text-xs font-medium text-center leading-tight">{sp.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
        >
          {[
            { label: "Home Visit", desc: "Doctor at your door", icon: "🏠", color: "bg-orange-50 border-orange-200 text-orange-700", href: "/doctors" },
            { label: "Emergency Care", desc: "Urgent consultation now", icon: "🚨", color: "bg-red-50 border-red-200 text-red-700", href: "/doctors" },
            { label: "Lab Tests", desc: "Book at-home tests", icon: "🔬", color: "bg-green-50 border-green-200 text-green-700", href: "/doctors" },
          ].map((qa) => (
            <motion.div
              key={qa.label}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(qa.href)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer hover:shadow-md transition-all ${qa.color}`}
            >
              <span className="text-3xl">{qa.icon}</span>
              <div>
                <div className="font-semibold text-sm">{qa.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{qa.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Doctors Grid */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-foreground">
              {showFiltered ? `Results (${filtered.length})` : "Top Rated Doctors"}
            </h2>
            {!showFiltered && (
              <button onClick={() => navigate("/doctors")} className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 && showFiltered ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-lg font-medium text-foreground">No doctors found</div>
              <div className="text-muted-foreground text-sm mt-1">Try a different search or remove filters</div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            >
              {(showFiltered ? filtered : doctors.slice(0, 6)).map((doc) => (
                <motion.div key={doc.id} variants={fadeUp}>
                  <DoctorCard doctor={doc as any} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#0F2040] to-[#0A3D8F] text-white mt-16 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                <span className="text-xl font-bold">Medofile</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">Your complete healthcare platform — connecting patients with the best doctors across India.</p>
            </div>
            {[
              { title: "For Patients", links: [{ label: "Find Doctors", href: "/doctors" }, { label: "AI Assistant", href: "/healthbot" }, { label: "Home Visit", href: "/doctors" }, { label: "Book Appointment", href: "/doctors" }] },
              { title: "For Doctors", links: [{ label: "Join Medofile", href: "#" }, { label: "Admin Login", href: "/admin" }, { label: "Analytics", href: "/admin" }, { label: "Grow Practice", href: "#" }] },
              { title: "Company", links: [{ label: "About Us", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-semibold mb-3 text-white/90">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => navigate(link.href)}
                        className="text-white/55 hover:text-white text-sm transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-white/50 text-sm">© 2026 Medofile. All rights reserved.</div>
            <div className="flex gap-4 text-white/50 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
