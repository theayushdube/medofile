import { useState } from "react";
import React from "react";
import { useRoute, useLocation } from "wouter";
import {
  Star, MapPin, Shield, Phone, Calendar, Home, Building2,
  Navigation, Clock, Award, GraduationCap, Globe, Instagram,
  Youtube, Facebook, Linkedin, Twitter, ChevronLeft, ExternalLink, TrendingUp
} from "lucide-react";
import { useDoctor } from "@/hooks/useDoctors";
import { Navbar } from "@/components/Navbar";

const TABS = ["Overview", "Treatments", "Reviews", "Location"] as const;
type Tab = (typeof TABS)[number];

const REVIEWS = [
  { id: "r1", doctorId: "1", name: "Rahul Gupta", rating: 5, comment: "Dr. Sharma is exceptional. He explained my condition very clearly and the treatment was very effective.", date: "2025-05-10" },
  { id: "r2", doctorId: "1", name: "Anita Verma", rating: 5, comment: "Very knowledgeable and patient doctor. He took time to understand my history before prescribing.", date: "2025-05-02" },
  { id: "r3", doctorId: "1", name: "Mohan Singh", rating: 4, comment: "Good doctor, but waiting time is long. The treatment was effective though.", date: "2025-04-20" },
  { id: "r4", doctorId: "2", name: "Pooja Shah", rating: 5, comment: "Dr. Priya is amazing! My skin has transformed completely after her treatment.", date: "2025-05-12" },
  { id: "r5", doctorId: "2", name: "Neha Joshi", rating: 5, comment: "Best dermatologist in Mumbai. Very thorough consultation and brilliant results.", date: "2025-04-28" },
];

function SocialIcon({ platform, value, label }: { platform: string; value: string; label: string }) {
  const configs: Record<string, { icon: React.ReactNode; color: string; prefix: string }> = {
    instagram: { icon: <Instagram className="w-4 h-4" />, color: "bg-pink-500", prefix: "https://instagram.com/" },
    facebook: { icon: <Facebook className="w-4 h-4" />, color: "bg-blue-600", prefix: "https://facebook.com/" },
    linkedin: { icon: <Linkedin className="w-4 h-4" />, color: "bg-blue-700", prefix: "https://linkedin.com/in/" },
    youtube: { icon: <Youtube className="w-4 h-4" />, color: "bg-red-600", prefix: "https://youtube.com/@" },
    x: { icon: <span className="font-bold text-sm">𝕏</span>, color: "bg-gray-900", prefix: "https://x.com/" },
    twitter: { icon: <Twitter className="w-4 h-4" />, color: "bg-sky-500", prefix: "https://x.com/" },
    website: { icon: <Globe className="w-4 h-4" />, color: "bg-green-600", prefix: "https://" },
    whatsapp: { icon: <span className="text-sm">📱</span>, color: "bg-green-500", prefix: "https://wa.me/" },
    telegram: { icon: <span className="text-sm">✈️</span>, color: "bg-sky-600", prefix: "https://t.me/" },
    googleBusiness: { icon: <span className="text-sm">🏢</span>, color: "bg-blue-500", prefix: "https://g.co/kgs/" },
  };
  const config = configs[platform];
  if (!config) return null;
  const url = value.startsWith("http") ? value : `${config.prefix}${value.replace(/^[@]/, "")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className={`w-9 h-9 ${config.color} rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
    >
      {config.icon}
    </a>
  );
}

export default function DoctorProfile() {
  const [, params] = useRoute("/doctors/:id");
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showMap, setShowMap] = useState(false);

  const { doctor, loading } = useDoctor(params?.id);
  const reviews = REVIEWS.filter((r) => r.doctorId === params?.id);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm animate-pulse">Loading doctor profile...</div>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="text-4xl">🔍</div>
        <div className="font-semibold text-foreground">Doctor not found</div>
        <button onClick={() => navigate("/doctors")} className="text-primary text-sm hover:underline">Browse all doctors</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back + hero */}
      <div className="bg-gradient-to-br from-[#0A3D8F] via-[#1B72E8] to-[#3B8FEF] text-white pt-6 pb-8">
        <div className="max-w-5xl mx-auto px-4">
          <button onClick={() => navigate(-1 as any)} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to doctors
          </button>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img src={doctor.avatar} alt={doctor.name} className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-xl" />
              {doctor.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Verified
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{doctor.name}</h1>
                {doctor.isPremium && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-lg">⭐ Premium</span>
                )}
              </div>
              <p className="text-blue-200 font-medium">{doctor.qualification}</p>
              <p className="text-blue-300 text-sm mt-0.5">{doctor.clinicName} • {doctor.city}</p>

              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-white/60 text-sm">({doctor.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-200" />
                  <span className="text-sm">{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-200" />
                  <span className="text-sm">{doctor.address}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-5">
                <a
                  href={`tel:${doctor.phone}`}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <a
                  href={doctor.socials.whatsapp ? `https://wa.me/${doctor.socials.whatsapp.replace(/\D/g, "")}` : `https://wa.me/${doctor.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  💬 WhatsApp
                </a>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Location
                </button>
                <button
                  onClick={() => navigate(`/book/${doctor.id}`)}
                  className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>
              </div>
            </div>

            {/* Fee card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-32 border border-white/20">
              <div className="text-3xl font-bold">₹{doctor.fee}</div>
              <div className="text-white/70 text-xs mt-0.5">Consultation fee</div>
              <div className="mt-3 flex flex-col gap-1.5">
                {doctor.consultationTypes.includes("clinic") && (
                  <span className="text-xs bg-white/15 rounded-lg px-2 py-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> In-Clinic</span>
                )}
                  {doctor.consultationTypes.includes("home") && (
                  <span className="text-xs bg-white/15 rounded-lg px-2 py-1 flex items-center gap-1.5"><Home className="w-3 h-3" /> Home Visit</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location map panel */}
      {showMap && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" /> Clinic Location
                </h3>
                <a
                  href={doctor.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
                >
                  Open in Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">{doctor.address}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{doctor.city}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {doctor.branches.map((b, i) => (
                  <div key={i} className="bg-muted rounded-xl p-3">
                    <div className="font-medium text-sm text-foreground">{b.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{b.address}</div>
                    <div className="text-xs text-primary mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {b.timing}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview Tab */}
            {activeTab === "Overview" && (
              <>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-foreground mb-3">About Dr. {doctor.name.split(" ").slice(-1)[0]}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{doctor.about}</p>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Education
                  </h2>
                  <div className="space-y-3">
                    {doctor.education.map((e, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{e.year.toString().slice(-2)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{e.degree}</div>
                          <div className="text-muted-foreground text-xs">{e.college}, {e.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-foreground mb-3">Memberships</h2>
                  <div className="flex flex-wrap gap-2">
                    {doctor.memberships.map((m) => (
                      <span key={m} className="text-xs bg-secondary text-primary px-3 py-1.5 rounded-lg font-medium">{m}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-foreground mb-3">Accepted Insurance</h2>
                  <div className="flex flex-wrap gap-2">
                    {doctor.insurances.map((ins) => (
                      <span key={ins} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">{ins}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Treatments Tab */}
            {activeTab === "Treatments" && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Treatments & Procedures</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctor.treatments.map((t) => (
                    <div key={t} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm text-foreground">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "Reviews" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">{doctor.rating}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(doctor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{doctor.reviewCount} reviews</div>
                    </div>
                  </div>
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No reviews yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((r) => (
                        <div key={r.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-foreground">{r.name}</span>
                            <span className="text-xs text-muted-foreground">{r.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-sm">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "Location" && (
              <div className="space-y-4">
                {doctor.branches.map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-3">{b.name} Branch</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {b.address}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        {b.timing}
                      </div>
                    </div>
                    <a
                      href={doctor.location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors w-fit"
                    >
                      <Navigation className="w-4 h-4" /> Get Directions
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Book Card */}
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-32">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-primary">₹{doctor.fee}</div>
                <div className="text-xs text-muted-foreground">Consultation fee</div>
              </div>
              <button
                onClick={() => navigate(`/book/${doctor.id}`)}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors mb-3"
              >
                Book Appointment
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${doctor.phone}`}
                  className="flex items-center justify-center gap-1.5 border border-border text-foreground py-2.5 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${(doctor.socials.whatsapp || doctor.phone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 border border-green-200 bg-green-50 text-green-700 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  💬 Chat
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground mb-2">Timing</div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {doctor.timing}
                </div>
                {doctor.emergencyAvailable && (
                  <div className="mt-2 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    🚨 Emergency available
                  </div>
                )}
              </div>
            </div>

            {/* Social media */}
            {Object.keys(doctor.socials).length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">Connect Online</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(doctor.socials).map(([key, value]) =>
                    value ? (
                      <SocialIcon
                        key={key}
                        platform={key}
                        value={value}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Analytics teaser */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Practice Insights
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { label: "Profile Views", value: doctor.analytics.profileViews.toLocaleString() },
                  { label: "Call Clicks", value: doctor.analytics.callClicks.toString() },
                  { label: "Bookings", value: doctor.analytics.bookings.toString() },
                  { label: "Directions", value: doctor.analytics.directionsClicks.toString() },
                ].map((m) => (
                  <div key={m.label} className="bg-white rounded-xl p-3 border border-border">
                    <div className="text-lg font-bold text-primary">{m.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
