import { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { DOCTORS, SPECIALIZATIONS } from "@/data/doctors";
import { Navbar } from "@/components/Navbar";
import { DoctorCard } from "@/components/DoctorCard";

const CITIES = ["All Cities", "New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Kolkata", "Gurugram"];
const SORT_OPTIONS = ["Relevance", "Rating: High to Low", "Fee: Low to High", "Experience: Most"];

export default function DoctorList() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [sort, setSort] = useState("Relevance");
  const [genderFilter, setGenderFilter] = useState<"All" | "Male" | "Female">("All");
  const [consultFilter, setConsultFilter] = useState<"" | "clinic" | "video" | "home">("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let docs = DOCTORS.filter((d) => {
      const q = search.toLowerCase();
      return (
        (!q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)) &&
        (city === "All Cities" || d.city === city) &&
        (!selectedSpec || d.specialization === selectedSpec) &&
        (genderFilter === "All" || d.gender === genderFilter) &&
        (!consultFilter || d.consultationTypes.includes(consultFilter))
      );
    });

    if (sort === "Rating: High to Low") docs = [...docs].sort((a, b) => b.rating - a.rating);
    else if (sort === "Fee: Low to High") docs = [...docs].sort((a, b) => a.fee - b.fee);
    else if (sort === "Experience: Most") docs = [...docs].sort((a, b) => b.experience - a.experience);

    return docs;
  }, [search, city, selectedSpec, sort, genderFilter, consultFilter]);

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

              {/* Consult type */}
              {["", "clinic", "video", "home"].map((t) => (
                <button
                  key={t}
                  onClick={() => setConsultFilter(t as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${consultFilter === t ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/50"}`}
                >
                  {t === "" ? "All Types" : t === "clinic" ? "In-Clinic" : t === "video" ? "Video" : "Home Visit"}
                </button>
              ))}

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
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </h1>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-semibold text-foreground mb-2">No doctors found</div>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
