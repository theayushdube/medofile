import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Shield, Users, Calendar, TrendingUp, Search, Eye, Phone, ChevronLeft,
  Star, MapPin, CheckCircle, XCircle, BarChart2, MessageCircle, Navigation
} from "lucide-react";
import { DOCTORS, getBookings, updateBookingStatus } from "@/data/doctors";
import { Navbar } from "@/components/Navbar";

const ADMIN_PASSWORD = "medofile2026";

type AdminTab = "overview" | "doctors" | "bookings" | "analytics";

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchDoctor, setSearchDoctor] = useState("");
  const [bookings, setBookings] = useState(getBookings());
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Try: medofile2026");
    }
  }

  function handleUpdateBooking(id: string, status: "upcoming" | "completed" | "cancelled") {
    updateBookingStatus(id, status);
    setBookings(getBookings());
  }

  const filteredDoctors = useMemo(() =>
    DOCTORS.filter(d =>
      !searchDoctor ||
      d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      d.city.toLowerCase().includes(searchDoctor.toLowerCase())
    ), [searchDoctor]
  );

  const totalImpressions = DOCTORS.reduce((s, d) => s + d.analytics.impressions, 0);
  const totalBookings = DOCTORS.reduce((s, d) => s + d.analytics.bookings, 0);
  const totalCallClicks = DOCTORS.reduce((s, d) => s + d.analytics.callClicks, 0);
  const totalChatClicks = DOCTORS.reduce((s, d) => s + d.analytics.chatClicks, 0);
  const avgRating = (DOCTORS.reduce((s, d) => s + d.rating, 0) / DOCTORS.length).toFixed(1);

  // Login page
  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-3xl border border-border p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground text-sm mt-1">Enter password to access admin dashboard</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Admin Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary text-sm transition-colors"
                  />
                  {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl text-xs text-blue-700">
                <strong>Demo access:</strong> Password is <code className="bg-blue-100 px-1.5 py-0.5 rounded">medofile2026</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Admin header */}
      <div className="bg-gradient-to-r from-[#0F2040] to-[#1B72E8] text-white px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" />
              <span className="font-bold text-lg">Admin Dashboard</span>
              <span className="bg-green-400 text-green-900 text-xs font-semibold px-2 py-0.5 rounded-full">Live</span>
            </div>
            <p className="text-white/60 text-sm">Medofile — Full platform management</p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-white/70 hover:text-white text-sm transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0">
            {[
              { key: "overview", label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
              { key: "doctors", label: "Doctors", icon: <Users className="w-4 h-4" /> },
              { key: "bookings", label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
              { key: "analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AdminTab)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Doctors", value: DOCTORS.length, icon: "👨‍⚕️", color: "bg-blue-50 text-blue-600" },
                { label: "Total Impressions", value: totalImpressions.toLocaleString(), icon: "👁️", color: "bg-purple-50 text-purple-600" },
                { label: "Total Bookings", value: totalBookings, icon: "📅", color: "bg-green-50 text-green-600" },
                { label: "Call Clicks", value: totalCallClicks, icon: "📞", color: "bg-orange-50 text-orange-600" },
                { label: "Avg Rating", value: `${avgRating}★`, icon: "⭐", color: "bg-yellow-50 text-yellow-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.color.split(" ")[0]} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top doctors by booking */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4">Top Doctors by Bookings</h2>
              <div className="space-y-3">
                {[...DOCTORS].sort((a, b) => b.analytics.bookings - a.analytics.bookings).slice(0, 5).map((d, i) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-5 text-right">{i + 1}</span>
                    <img src={d.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialization} • {d.city}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm text-primary">{d.analytics.bookings}</div>
                      <div className="text-xs text-muted-foreground">bookings</div>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(d.analytics.bookings / DOCTORS[0].analytics.bookings) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {activeTab === "doctors" && (
          <div>
            <div className="flex gap-3 mb-6">
              <div className="flex items-center gap-2 flex-1 px-4 py-2.5 bg-white rounded-xl border border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  placeholder="Search doctors..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl border border-border p-5 hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{doc.name}</h3>
                        {doc.isVerified && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>}
                        {doc.isPremium && <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">⭐ Premium</span>}
                      </div>
                      <p className="text-muted-foreground text-sm mt-0.5">{doc.qualification}</p>
                      <p className="text-primary text-xs font-medium mt-0.5">{doc.specialization} • {doc.city}</p>

                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{doc.rating}★</span> ({doc.reviewCount} reviews)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">₹{doc.fee}</span> fee
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{doc.experience}y</span> exp
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Reg: <span className="font-medium text-foreground">{doc.registrationNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini analytics */}
                    <div className="hidden md:grid grid-cols-3 gap-3 shrink-0">
                      {[
                        { label: "Views", value: doc.analytics.profileViews },
                        { label: "Calls", value: doc.analytics.callClicks },
                        { label: "Bookings", value: doc.analytics.bookings },
                      ].map((m) => (
                        <div key={m.label} className="bg-muted rounded-xl p-3 text-center">
                          <div className="font-bold text-sm text-primary">{m.value}</div>
                          <div className="text-xs text-muted-foreground">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social links row */}
                  {Object.keys(doc.socials).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex gap-2 flex-wrap text-xs text-muted-foreground">
                      {doc.phone && <span className="bg-muted px-2 py-1 rounded-lg">📞 {doc.phone}</span>}
                      {doc.socials.whatsapp && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg">💬 WhatsApp</span>}
                      {doc.socials.instagram && <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-lg">📸 Instagram</span>}
                      {doc.socials.youtube && <span className="bg-red-50 text-red-700 px-2 py-1 rounded-lg">▶️ YouTube</span>}
                      {doc.socials.googleBusiness && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">🏢 Google Business</span>}
                      {doc.socials.website && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg">🌐 Website</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-foreground">All Bookings ({bookings.length})</h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📅</div>
                <div className="text-lg font-medium text-foreground">No bookings yet</div>
                <p className="text-muted-foreground text-sm mt-1">Bookings made through the website will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const doc = DOCTORS.find(d => d.id === b.doctorId);
                  return (
                    <div key={b.id} className="bg-white rounded-2xl border border-border p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img src={doc?.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground text-sm">{b.patientName}</div>
                            <div className="text-muted-foreground text-xs mt-0.5">{b.patientEmail} • {b.patientPhone}</div>
                            <div className="text-primary text-xs font-medium mt-1">Dr. {doc?.name} — {doc?.specialization}</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-primary">₹{b.fee}</div>
                          <div className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                            b.status === "upcoming" ? "bg-blue-50 text-blue-700" :
                            b.status === "completed" ? "bg-green-50 text-green-700" :
                            "bg-red-50 text-red-700"
                          }`}>
                            {b.status}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded-lg">📅 {b.date}</span>
                        <span className="bg-muted px-2 py-1 rounded-lg">🕐 {b.time}</span>
                        <span className="bg-muted px-2 py-1 rounded-lg">
                          {b.type === "clinic" ? "🏥 In-Clinic" : b.type === "video" ? "📹 Video" : "🏠 Home"}
                        </span>
                        {b.branch && <span className="bg-muted px-2 py-1 rounded-lg">📍 {b.branch}</span>}
                      </div>

                      {b.patientProblem && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                          <span className="font-medium">Concern:</span> {b.patientProblem}
                        </div>
                      )}

                      {b.status === "upcoming" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleUpdateBooking(b.id, "completed")}
                            className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                          </button>
                          <button
                            onClick={() => handleUpdateBooking(b.id, "cancelled")}
                            className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-foreground text-xl">Platform Analytics</h2>

            {/* Aggregate metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Impressions", value: totalImpressions.toLocaleString(), change: "+12%", icon: "👁️", color: "blue" },
                { label: "Total Bookings", value: totalBookings, change: "+8%", icon: "📅", color: "green" },
                { label: "Call Clicks", value: totalCallClicks, change: "+15%", icon: "📞", color: "orange" },
                { label: "Chat Clicks", value: totalChatClicks, change: "+21%", icon: "💬", color: "purple" },
                { label: "Direction Clicks", value: DOCTORS.reduce((s, d) => s + d.analytics.directionsClicks, 0), change: "+5%", icon: "🗺️", color: "teal" },
                { label: "Avg Engagement", value: `${((totalBookings / totalImpressions) * 100).toFixed(1)}%`, change: "+2%", icon: "📊", color: "red" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{m.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{m.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Per-doctor analytics */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Doctor-wise Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Doctor</th>
                      <th className="px-4 py-3 text-right">Impressions</th>
                      <th className="px-4 py-3 text-right">Views</th>
                      <th className="px-4 py-3 text-right">Calls</th>
                      <th className="px-4 py-3 text-right">Chats</th>
                      <th className="px-4 py-3 text-right">Directions</th>
                      <th className="px-4 py-3 text-right">Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...DOCTORS].sort((a, b) => b.analytics.impressions - a.analytics.impressions).map((d, i) => (
                      <tr key={d.id} className={`border-t border-border text-sm ${i % 2 === 0 ? "" : "bg-muted/20"} hover:bg-blue-50/50 transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={d.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <div className="font-medium text-foreground">{d.name}</div>
                              <div className="text-xs text-muted-foreground">{d.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{d.analytics.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{d.analytics.profileViews.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-orange-600">{d.analytics.callClicks}</td>
                        <td className="px-4 py-3 text-right text-purple-600">{d.analytics.chatClicks}</td>
                        <td className="px-4 py-3 text-right text-teal-600">{d.analytics.directionsClicks}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{d.analytics.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
