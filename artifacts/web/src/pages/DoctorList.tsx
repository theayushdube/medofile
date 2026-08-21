import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, X, LocateFixed } from "lucide-react";
import { motion } from "framer-motion";
import { SPECIALIZATIONS } from "@/data/doctors";
import { useDoctors } from "@/hooks/useDoctors";
import { Navbar } from "@/components/Navbar";
import { DoctorCard } from "@/components/DoctorCard";

const CITIES = ["All Cities", "New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Kolkata", "Gurugram"];
const SORT_OPTIONS = ["Relevance", "Rating: High to Low", "Fee: Low to High", "Experience: Most"];

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

export default function DoctorList() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [sort, setSort] = useState("Relevance");
  const [genderFilter, setGenderFilter] = useState<"All" | "Male" | "Female">("All");
  const [consultFilter, setConsultFilter] = useState<"" | "clinic" | "home">("");
  const [language, setLanguage] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [availability, setAvailability] = useState<"" | "available">("");
  const [showFilters, setShowFilters] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q"); const c = params.get("city");
    if (q) setSearch(q);
    if (c && c !== "All Cities") setCity(c);
  }, []);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCity(nearestCity(pos.coords.latitude, pos.coords.longitude)); setLocating(false); },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  const { doctors: filtered, loading } = useDoctors({
    q: search,
    city: city === "All Cities" ? "" : city,
    specialization: selectedSpec,
    gender: genderFilter === "All" ? "" : genderFilter,
    consultationType: consultFilter,
    language,
    maxFee,
    availability,
    sort: sort === "Rating: High to Low" ? "rating" : sort === "Fee: Low to High" ? "fee" : sort === "Experience: Most" ? "experience" : "relevance",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Search header */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2.5 rounded-xl bg-muted border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                placeholder="Search doctor, specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch("")}><X className="w-3 h-3 text-muted-foreground" /></button>}
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted border border-border">
              <button
                title="Detect my location"
                onClick={detectLocation}
                disabled={locating}
                className="hover:text-primary transition-colors disabled:opacity-50"
              >
                <LocateFixed className={`w-4 h-4 ${locating ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
              </button>
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <select
                className="bg-transparent text-sm text-foreground outline-none cursor-pointer"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-border">
              {/* Specialization */}
              <select
                className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground outline-none"
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>

              {/* Gender */}
              {["All", "Male", "Female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${genderFilter === g ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/50"}`}
                >
                  {g === "All" ? "Any Gender" : g}
                </button>
              ))}

              {/* Consult type — no video */}
              {(["", "clinic", "home"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setConsultFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${consultFilter === t ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/50"}`}
                >
                  {t === "" ? "All Types" : t === "clinic" ? "In-Clinic" : "Home Visit"}
                </button>
              ))}
               <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" className="w-28 px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground outline-none" />
               <select value={maxFee} onChange={(e) => setMaxFee(e.target.value)} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground outline-none">
                 <option value="">Any fee</option><option value="500">Up to ₹500</option><option value="1000">Up to ₹1,000</option><option value="1500">Up to ₹1,500</option>
               </select>
               <button onClick={() => setAvailability(availability ? "" : "available")} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${availability ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/50"}`}>Available now</button>

              {/* Sort */}
              <select
                className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground outline-none ml-auto"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">
            {loading ? "Loading doctors..." : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} found`}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="h-52 rounded-2xl bg-muted"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-semibold text-foreground mb-2">No doctors found</div>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.map((doc) => (
              <motion.div
                key={doc.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              >
                <DoctorCard doctor={doc as any} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
