import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, X, LocateFixed, Navigation, CircleAlert } from "lucide-react";
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
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationError, setLocationError] = useState("");
  const [matchReasons, setMatchReasons] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q"); const c = params.get("city");
    if (q) setSearch(q);
    if (c && c !== "All Cities") setCity(c);
  }, []);

  async function getLocationLabel(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, { headers: { "Accept-Language": "en" } });
      const place = response.ok ? await response.json() as { address?: Record<string, string> } : null;
      const address = place?.address;
      const localArea = address?.suburb || address?.neighbourhood || address?.town || address?.city || address?.county;
      const region = address?.state_district || address?.state;
      if (localArea) return region ? `${localArea}, ${region}` : localArea;
    } catch {
      // Coordinates still provide an accurate nearby-doctor search if reverse geocoding is unavailable.
    }
    return nearestCity(lat, lng) !== "All Cities" ? `Near ${nearestCity(lat, lng)}` : "Your current area";
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const closestCity = nearestCity(latitude, longitude);
        setCoordinates({ lat: latitude, lng: longitude });
        if (closestCity !== "All Cities") setCity(closestCity);
        setLocationLabel(await getLocationLabel(latitude, longitude));
        setLocating(false);
      },
      (error) => {
        setLocationError(error.code === error.PERMISSION_DENIED ? "Location permission was denied. Choose a city instead." : "We could not get your location. Please try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }

  const { doctors: filtered, loading } = useDoctors({
    q: search,
    city: coordinates ? "" : city === "All Cities" ? "" : city,
    specialization: selectedSpec,
    gender: genderFilter === "All" ? "" : genderFilter,
    consultationType: consultFilter,
    language,
    maxFee,
    availability,
    sort: sort === "Rating: High to Low" ? "rating" : sort === "Fee: Low to High" ? "fee" : sort === "Experience: Most" ? "experience" : "relevance",
    lat: coordinates ? String(coordinates.lat) : "",
    lng: coordinates ? String(coordinates.lng) : "",
    radiusKm: coordinates ? "80" : "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSpec) params.set("specializations", selectedSpec);
    if (city !== "All Cities" && !coordinates) params.set("city", city);
    if (coordinates) { params.set("lat", String(coordinates.lat)); params.set("lng", String(coordinates.lng)); }
    if (language) params.set("language", language);
    if (maxFee) params.set("maxFee", maxFee);
    if (consultFilter) params.set("consultationType", consultFilter);
    if (availability) params.set("availability", availability);
    if (![...params.keys()].length) { setMatchReasons({}); return; }
    let cancelled = false;
    fetch(`/api/doctor-matches?${params}`).then((response) => response.ok ? response.json() : { data: [] }).then((payload) => {
      if (cancelled) return;
      setMatchReasons(Object.fromEntries((payload.data ?? []).map((match: { doctor: { id: number }; reasons: string[] }) => [match.doctor.id, match.reasons])));
    }).catch(() => !cancelled && setMatchReasons({}));
    return () => { cancelled = true; };
  }, [availability, city, consultFilter, coordinates, language, maxFee, selectedSpec]);

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
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${coordinates ? "bg-primary/5 border-primary/25" : "bg-muted border-border"}`}>
              <button
                title="Use my current location"
                onClick={detectLocation}
                disabled={locating}
                className="hover:text-primary transition-colors disabled:opacity-50"
              >
                {locating ? <LocateFixed className="w-4 h-4 animate-pulse text-primary" /> : <Navigation className={`w-4 h-4 ${coordinates ? "text-primary" : "text-muted-foreground"}`} />}
              </button>
              <MapPin className={`w-4 h-4 ${coordinates ? "text-primary" : "text-muted-foreground"}`} />
              <input
                list="doctor-city-options"
                aria-label="Search by city"
                className="w-32 bg-transparent text-sm text-foreground outline-none"
                placeholder="Type a city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (coordinates) { setCoordinates(null); setLocationLabel(""); }
                }}
              />
              <datalist id="doctor-city-options">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
          {(locationLabel || locationError) && <div className={`mt-3 flex items-center gap-2 text-xs font-medium ${locationError ? "text-amber-700" : "text-primary"}`}>
            {locationError ? <CircleAlert className="w-3.5 h-3.5" /> : <LocateFixed className="w-3.5 h-3.5" />}
            <span>{locationError || `Showing doctors near ${locationLabel}`}</span>
            {coordinates && !locationError && <button onClick={() => { setCoordinates(null); setLocationLabel(""); }} className="underline underline-offset-2">Clear</button>}
          </div>}

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
                <DoctorCard doctor={doc as any} matchReasons={matchReasons[Number(doc.id)]} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
