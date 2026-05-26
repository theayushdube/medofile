import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Star, Shield, Video, Phone, ChevronDown, Sparkles, ArrowRight, CheckCircle, Heart, Brain, Bone, Baby, Eye, Smile } from "lucide-react";
import { DOCTORS, SPECIALIZATIONS } from "@/data/doctors";
import { Navbar } from "@/components/Navbar";
import { DoctorCard } from "@/components/DoctorCard";

const CITIES = ["New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Kolkata", "Gurugram", "Chennai", "Pune"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export default function Home() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [selectedSpec, setSelectedSpec] = useState("");

  const filtered = useMemo(() => {
    return DOCTORS.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
      const matchCity = city === "All Cities" || d.city === city;
      const matchSpec = !selectedSpec || d.specialization === selectedSpec;
      return matchSearch && matchCity && matchSpec;
    });
  }, [search, city, selectedSpec]);

  const showFiltered = !!(search || selectedSpec || city !== "All Cities");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A3D8F] via-[#1B72E8] to-[#3B8FEF] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#00C897] blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-[#00C897] animate-pulse" />
              Trusted by 50,000+ patients across India
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Find the Right Doctor,<br />
              <span className="text-[#A8D4FF]">Book Instantly</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Search from 1000+ verified specialists across India. Book appointments, consult online, get home visits — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["Verified Doctors", "Instant Booking", "Free Cancellation", "AI Health Assistant"].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00C897]" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none"
                placeholder="Search doctor, specialization, symptom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 sm:w-44">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                className="flex-1 bg-transparent text-gray-700 text-sm outline-none cursor-pointer"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option>All Cities</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <button
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
              onClick={() => navigate(`/doctors?q=${encodeURIComponent(search)}&city=${encodeURIComponent(city)}`)}
            >
              Search Doctors
            </button>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="hsl(213, 33%, 97%)" />
          </svg>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "1,000+", label: "Verified Doctors", icon: "🏥" },
            { value: "50,000+", label: "Happy Patients", icon: "😊" },
            { value: "20+", label: "Cities Covered", icon: "📍" },
            { value: "4.8★", label: "Average Rating", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* AI Health Assistant Banner */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[#00C897] text-white p-6 mb-10 cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => navigate("/doctors")}
        >
          <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10">
            <div className="w-full h-full bg-white rounded-full transform translate-x-1/2 -translate-y-1/4" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">✨</div>
            <div className="flex-1">
              <div className="font-bold text-lg">AI Health Assistant</div>
              <div className="text-white/80 text-sm mt-0.5">Describe your symptoms and get instant doctor suggestions powered by AI</div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2.5 font-medium text-sm">
              Try Now <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Browse by Specialty */}
        <h2 className="text-2xl font-bold text-foreground mb-5">Browse by Specialty</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
          <button
            onClick={() => setSelectedSpec("")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              !selectedSpec ? "border-primary bg-secondary text-primary" : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            <span className="text-2xl">🔭</span>
            <span className="text-xs font-medium text-center leading-tight">All</span>
          </button>
          {SPECIALIZATIONS.map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSelectedSpec(selectedSpec === sp.name ? "" : sp.name)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                selectedSpec === sp.name ? "border-primary bg-secondary text-primary" : "border-border bg-white text-foreground hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{sp.emoji}</span>
              <span className="text-xs font-medium text-center leading-tight">{sp.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Video Consult", desc: "Consult from home", icon: "📹", color: "bg-purple-50 border-purple-200 text-purple-700" },
            { label: "Home Visit", desc: "Doctor at your door", icon: "🏠", color: "bg-orange-50 border-orange-200 text-orange-700" },
            { label: "Emergency", desc: "Urgent care now", icon: "🚨", color: "bg-red-50 border-red-200 text-red-700" },
            { label: "Lab Tests", desc: "Book at-home tests", icon: "🔬", color: "bg-green-50 border-green-200 text-green-700" },
          ].map((qa) => (
            <div key={qa.label} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer hover:shadow-md transition-shadow ${qa.color}`}>
              <span className="text-3xl">{qa.icon}</span>
              <div>
                <div className="font-semibold text-sm">{qa.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{qa.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Doctors Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showFiltered ? filtered : DOCTORS.slice(0, 6)).map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
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
              { title: "For Patients", links: ["Find Doctors", "Video Consult", "Home Visit", "Lab Tests"] },
              { title: "For Doctors", links: ["Join Medofile", "Doctor Login", "Analytics", "Grow Practice"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-semibold mb-3 text-white/90">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-white/55 hover:text-white text-sm transition-colors">{link}</a></li>
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
