import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Shield, Users, Calendar, TrendingUp, Search, Eye, Phone, Plus, Trash2,
  Star, CheckCircle, XCircle, BarChart2, MessageCircle, Navigation, Edit,
  LogOut, UserCog, AlertTriangle, X, Save, ChevronRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Navbar } from "@/components/Navbar";

const API_BASE = "/api";

interface Doctor {
  id: number; name: string; qualification: string; specialization: string;
  experience: number; rating: number; reviewCount: number; fee: number;
  hospital: string; clinicName: string; address: string; city: string;
  phone: string; about: string; languages: string[]; availability: string;
  isVerified: boolean; isPremium: boolean; emergencyAvailable: boolean;
  gender: string; consultationTypes: string[]; registrationNumber: string;
  avatar: string;
  location: { lat: number; lng: number; mapsUrl: string };
  socials: Record<string, string>;
  analytics: { impressions: number; profileViews: number; callClicks: number; chatClicks: number; bookings: number; directionsClicks: number; weeklyTrend: number[] };
  treatments: string[]; education: { degree: string; college: string; year: number }[];
  memberships: string[]; insurances: string[]; timing: string;
  branches: { name: string; address: string; timing: string }[];
}

interface Booking {
  id: number; doctorId: number; patientName: string; patientEmail: string;
  patientPhone: string; patientProblem: string; date: string; time: string;
  type: string; branch: string; fee: number; status: string; createdAt: string;
}

interface AdminUser { id: number; username: string; role: string; createdAt: string; }
interface AuthData { token: string; user: { id: number; username: string; role: string; } }

type AdminTab = "overview" | "doctors" | "bookings" | "analytics" | "users";

const SPECIALIZATIONS = ["Cardiologist","Dermatologist","Neurologist","Orthopedic","Pediatrician","Gynecologist","Dentist","General Physician","Ophthalmologist","Psychiatrist","ENT Specialist","Oncologist"];
const CITIES = ["New Delhi","Mumbai","Bengaluru","Hyderabad","Kolkata","Gurugram","Chennai","Pune"];

function authHeaders(token: string) { return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }; }

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [auth, setAuth] = useState<AuthData | null>(() => {
    try { const s = localStorage.getItem("medofile_admin_auth"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [logging, setLogging] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");

  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({});
  const [saving, setSaving] = useState(false);

  const [newUserForm, setNewUserForm] = useState({ username: "", password: "", role: "admin" });
  const [addingUser, setAddingUser] = useState(false);

  const isSuperAdmin = auth?.user.role === "superadmin";

  async function handleLogin() {
    if (!username || !password) { setLoginError("Enter username and password"); return; }
    setLogging(true); setLoginError("");
    try {
      const r = await fetch(`${API_BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (!r.ok) { setLoginError("Invalid credentials. Check your username and password."); setLogging(false); return; }
      const data: AuthData = await r.json();
      localStorage.setItem("medofile_admin_auth", JSON.stringify(data));
      setAuth(data);
    } catch { setLoginError("Server error. Please try again."); }
    setLogging(false);
  }

  function handleLogout() { localStorage.removeItem("medofile_admin_auth"); setAuth(null); }

  const loadDoctors = useCallback(async () => {
    if (!auth) return;
    const r = await fetch(`${API_BASE}/doctors`);
    if (r.ok) setDoctors(await r.json());
  }, [auth]);

  const loadBookings = useCallback(async () => {
    if (!auth) return;
    const r = await fetch(`${API_BASE}/bookings`, { headers: authHeaders(auth.token) });
    if (r.ok) setBookings(await r.json());
  }, [auth]);

  const loadUsers = useCallback(async () => {
    if (!auth || !isSuperAdmin) return;
    const r = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders(auth.token) });
    if (r.ok) setAdminUsers(await r.json());
  }, [auth, isSuperAdmin]);

  useEffect(() => {
    if (auth) { loadDoctors(); loadBookings(); if (isSuperAdmin) loadUsers(); }
  }, [auth, loadDoctors, loadBookings, loadUsers, isSuperAdmin]);

  async function handleDeleteDoctor(id: number) {
    if (!auth || !isSuperAdmin) return;
    if (!confirm("Delete this doctor? This cannot be undone.")) return;
    await fetch(`${API_BASE}/doctors/${id}`, { method: "DELETE", headers: authHeaders(auth.token) });
    await loadDoctors();
  }

  async function handleSaveDoctor() {
    if (!auth) return;
    setSaving(true);
    const method = editingDoctor ? "PUT" : "POST";
    const url = editingDoctor ? `${API_BASE}/doctors/${editingDoctor.id}` : `${API_BASE}/doctors`;
    const r = await fetch(url, { method, headers: authHeaders(auth.token), body: JSON.stringify(doctorForm) });
    if (r.ok) { await loadDoctors(); setShowDoctorForm(false); setEditingDoctor(null); setDoctorForm({}); }
    setSaving(false);
  }

  async function handleBookingStatus(id: number, status: string) {
    if (!auth) return;
    await fetch(`${API_BASE}/bookings/${id}/status`, { method: "PUT", headers: authHeaders(auth.token), body: JSON.stringify({ status }) });
    await loadBookings();
  }

  async function handleAddUser() {
    if (!auth || !isSuperAdmin) return;
    if (!newUserForm.username || !newUserForm.password) return;
    setAddingUser(true);
    const r = await fetch(`${API_BASE}/admin/users`, { method: "POST", headers: authHeaders(auth.token), body: JSON.stringify(newUserForm) });
    if (r.ok) { await loadUsers(); setNewUserForm({ username: "", password: "", role: "admin" }); }
    setAddingUser(false);
  }

  async function handleDeleteUser(id: number) {
    if (!auth || !isSuperAdmin) return;
    if (!confirm("Delete this admin user?")) return;
    await fetch(`${API_BASE}/admin/users/${id}`, { method: "DELETE", headers: authHeaders(auth.token) });
    await loadUsers();
  }

  const filteredDoctors = useMemo(() =>
    doctors.filter(d => !searchDoctor || d.name.toLowerCase().includes(searchDoctor.toLowerCase()) || d.specialization.toLowerCase().includes(searchDoctor.toLowerCase()) || d.city.toLowerCase().includes(searchDoctor.toLowerCase())),
    [doctors, searchDoctor]
  );

  const totalImpressions = doctors.reduce((s, d) => s + (d.analytics?.impressions || 0), 0);
  const totalBookingsCount = doctors.reduce((s, d) => s + (d.analytics?.bookings || 0), 0);
  const totalCallClicks = doctors.reduce((s, d) => s + (d.analytics?.callClicks || 0), 0);
  const totalChatClicks = doctors.reduce((s, d) => s + (d.analytics?.chatClicks || 0), 0);
  const avgRating = doctors.length ? (doctors.reduce((s, d) => s + d.rating, 0) / doctors.length).toFixed(1) : "0";

  function openEditDoctor(doc: Doctor) {
    setEditingDoctor(doc);
    setDoctorForm({ ...doc });
    setShowDoctorForm(true);
  }

  function openAddDoctor() {
    setEditingDoctor(null);
    setDoctorForm({ isVerified: false, isPremium: false, emergencyAvailable: false, gender: "Male", consultationTypes: ["clinic"], languages: [], treatments: [], education: [], memberships: [], insurances: [], branches: [], socials: {}, location: { lat: 0, lng: 0, mapsUrl: "" }, analytics: { impressions: 0, profileViews: 0, callClicks: 0, chatClicks: 0, bookings: 0, directionsClicks: 0, weeklyTrend: [0,0,0,0,0,0,0] } });
    setShowDoctorForm(true);
  }

  if (!auth) {
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
                <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
                <p className="text-muted-foreground text-sm mt-1">Secure access — Medofile Admin Portal</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary text-sm transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary text-sm transition-colors" />
                  {loginError && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{loginError}</p>}
                </div>
                <button onClick={handleLogin} disabled={logging}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {logging ? "Signing in..." : "Sign In"}
                </button>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-xl text-xs text-muted-foreground">
                <strong>Access levels:</strong> Super Admin (full access) · Admin (doctor profiles only)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allTabs: { key: AdminTab; label: string; icon: React.ReactNode; superOnly?: boolean }[] = [
    { key: "overview" as AdminTab, label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
    { key: "doctors" as AdminTab, label: "Doctors", icon: <Users className="w-4 h-4" /> },
    { key: "bookings" as AdminTab, label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
    { key: "analytics" as AdminTab, label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "users" as AdminTab, label: "Users", icon: <UserCog className="w-4 h-4" />, superOnly: true },
  ];
  const tabs = allTabs.filter(t => !t.superOnly || isSuperAdmin);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-[#0F2040] to-[#1B72E8] text-white px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" />
              <span className="font-bold text-lg">Admin Dashboard</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isSuperAdmin ? "bg-yellow-400 text-yellow-900" : "bg-green-400 text-green-900"}`}>
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </span>
            </div>
            <p className="text-white/60 text-sm">Logged in as <strong>{auth.user.username}</strong></p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Doctors", value: doctors.length, icon: "👨‍⚕️", color: "bg-blue-50 text-blue-600" },
                { label: "Total Impressions", value: totalImpressions.toLocaleString(), icon: "👁️", color: "bg-purple-50 text-purple-600" },
                { label: "Total Bookings", value: totalBookingsCount, icon: "📅", color: "bg-green-50 text-green-600" },
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Top Doctors by Bookings</h2>
                <div className="space-y-3">
                  {[...doctors].sort((a, b) => (b.analytics?.bookings || 0) - (a.analytics?.bookings || 0)).slice(0, 5).map((d, i) => (
                    <div key={d.id} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-5 text-right">{i + 1}</span>
                      <img src={d.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.specialization} · {d.city}</div>
                      </div>
                      <div className="font-semibold text-sm text-primary">{d.analytics?.bookings}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Recent Bookings</h2>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((b) => {
                    const doc = doctors.find(d => d.id === b.doctorId);
                    return (
                      <div key={b.id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{b.patientName}</div>
                          <div className="text-xs text-muted-foreground">{doc?.name} · {b.date}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "upcoming" ? "bg-blue-50 text-blue-700" : b.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{b.status}</span>
                      </div>
                    );
                  })}
                  {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "doctors" && (
          <div>
            <div className="flex gap-3 mb-6">
              <div className="flex items-center gap-2 flex-1 px-4 py-2.5 bg-white rounded-xl border border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  placeholder="Search doctors by name, specialty, city..."
                  value={searchDoctor} onChange={(e) => setSearchDoctor(e.target.value)} />
              </div>
              <button onClick={openAddDoctor}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Doctor
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{doc.name}</h3>
                        {doc.isVerified && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>}
                        {doc.isPremium && <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">⭐ Premium</span>}
                      </div>
                      <p className="text-muted-foreground text-sm mt-0.5">{doc.qualification}</p>
                      <p className="text-primary text-xs font-medium mt-0.5">{doc.specialization} · {doc.city}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                        <span><strong className="text-foreground">{doc.rating}★</strong> ({doc.reviewCount})</span>
                        <span>₹<strong className="text-foreground">{doc.fee}</strong></span>
                        <span><strong className="text-foreground">{doc.experience}y</strong> exp</span>
                        <span>📞 {doc.phone}</span>
                      </div>
                    </div>
                    <div className="hidden md:grid grid-cols-3 gap-2 shrink-0 text-center">
                      {[["Views", doc.analytics?.profileViews], ["Calls", doc.analytics?.callClicks], ["Bookings", doc.analytics?.bookings]].map(([l, v]) => (
                        <div key={l as string} className="bg-muted rounded-xl p-2.5">
                          <div className="font-bold text-sm text-primary">{v}</div>
                          <div className="text-xs text-muted-foreground">{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => openEditDoctor(doc)} className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      {isSuperAdmin && (
                        <button onClick={() => handleDeleteDoctor(doc.id)} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-foreground">All Bookings ({bookings.length})</h2>
              <button onClick={loadBookings} className="text-xs text-primary hover:underline">Refresh</button>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📅</div>
                <div className="text-lg font-medium text-foreground">No bookings yet</div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const doc = doctors.find(d => d.id === b.doctorId);
                  return (
                    <div key={b.id} className="bg-white rounded-2xl border border-border p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img src={doc?.avatar || ""} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground text-sm">{b.patientName}</div>
                            <div className="text-muted-foreground text-xs mt-0.5">{b.patientEmail} · {b.patientPhone}</div>
                            <div className="text-primary text-xs font-medium mt-1">{doc?.name} — {doc?.specialization}</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-primary">₹{b.fee}</div>
                          <span className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${b.status === "upcoming" ? "bg-blue-50 text-blue-700" : b.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{b.status}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded-lg">📅 {b.date}</span>
                        <span className="bg-muted px-2 py-1 rounded-lg">🕐 {b.time}</span>
                        <span className="bg-muted px-2 py-1 rounded-lg">{b.type === "clinic" ? "🏥 In-Clinic" : "🏠 Home Visit"}</span>
                        {b.branch && <span className="bg-muted px-2 py-1 rounded-lg">📍 {b.branch}</span>}
                      </div>
                      {b.patientProblem && <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-lg"><span className="font-medium">Concern:</span> {b.patientProblem}</div>}
                      {b.status === "upcoming" && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleBookingStatus(b.id, "completed")} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"><CheckCircle className="w-3.5 h-3.5" /> Complete</button>
                          <button onClick={() => handleBookingStatus(b.id, "cancelled")} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"><XCircle className="w-3.5 h-3.5" /> Cancel</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-foreground text-xl">Platform Analytics</h2>

            {/* Weekly Trend Chart */}
            {doctors.length > 0 && (() => {
              const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const chartData = DAYS.map((day, i) => {
                const row: Record<string, any> = { day };
                doctors.slice(0, 4).forEach((d) => {
                  row[d.name.split(" ")[1] || d.name] = d.analytics?.weeklyTrend?.[i] ?? 0;
                });
                return row;
              });
              const COLORS = ["#1B72E8", "#00C897", "#E53E3E", "#805AD5"];
              return (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">7-Day Booking Trend (Top 4 Doctors)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {doctors.slice(0, 4).map((d, i) => (
                        <Bar key={d.id} dataKey={d.name.split(" ")[1] || d.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={32} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Impressions", value: totalImpressions.toLocaleString(), icon: "👁️" },
                { label: "Total Bookings", value: totalBookingsCount, icon: "📅" },
                { label: "Call Clicks", value: totalCallClicks, icon: "📞" },
                { label: "Chat Clicks", value: totalChatClicks, icon: "💬" },
                { label: "Direction Clicks", value: doctors.reduce((s, d) => s + (d.analytics?.directionsClicks || 0), 0), icon: "🗺️" },
                { label: "Avg Engagement", value: totalImpressions ? `${((totalBookingsCount / totalImpressions) * 100).toFixed(2)}%` : "0%", icon: "📊" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl border border-border p-5">
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="text-2xl font-bold text-foreground">{m.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border"><h3 className="font-semibold text-foreground">Doctor-wise Performance</h3></div>
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
                    {[...doctors].sort((a, b) => (b.analytics?.impressions || 0) - (a.analytics?.impressions || 0)).map((d, i) => (
                      <tr key={d.id} className={`border-t border-border text-sm ${i % 2 === 0 ? "" : "bg-muted/20"} hover:bg-blue-50/50 transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={d.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div><div className="font-medium text-foreground">{d.name}</div><div className="text-xs text-muted-foreground">{d.city}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{(d.analytics?.impressions || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{d.analytics?.profileViews || 0}</td>
                        <td className="px-4 py-3 text-right text-orange-600">{d.analytics?.callClicks || 0}</td>
                        <td className="px-4 py-3 text-right text-purple-600">{d.analytics?.chatClicks || 0}</td>
                        <td className="px-4 py-3 text-right text-teal-600">{d.analytics?.directionsClicks || 0}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">{d.analytics?.bookings || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && isSuperAdmin && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4">Add Admin User</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Username" value={newUserForm.username} onChange={(e) => setNewUserForm(f => ({ ...f, username: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-primary" />
                <input type="password" placeholder="Password" value={newUserForm.password} onChange={(e) => setNewUserForm(f => ({ ...f, password: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-primary" />
                <select value={newUserForm.role} onChange={(e) => setNewUserForm(f => ({ ...f, role: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-primary bg-white">
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <button onClick={handleAddUser} disabled={addingUser}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {addingUser ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border"><h3 className="font-semibold text-foreground">Admin Users ({adminUsers.length})</h3></div>
              {adminUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-4 border-t border-border first:border-t-0">
                  <div>
                    <div className="font-medium text-foreground">{u.username}</div>
                    <div className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "superadmin" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>{u.role}</span>
                    {u.id !== auth.user.id && (
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDoctorForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold text-lg">{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h2>
              <button onClick={() => setShowDoctorForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name", placeholder: "Dr. ..." },
                  { key: "qualification", label: "Qualification", placeholder: "MBBS, MD..." },
                  { key: "phone", label: "Phone", placeholder: "+91-..." },
                  { key: "registrationNumber", label: "Reg. Number", placeholder: "MCI-..." },
                  { key: "hospital", label: "Hospital", placeholder: "Hospital name" },
                  { key: "clinicName", label: "Clinic Name", placeholder: "Clinic name" },
                  { key: "address", label: "Address", placeholder: "Street address" },
                  { key: "availability", label: "Availability", placeholder: "Mon-Sat, 10am-6pm" },
                  { key: "timing", label: "Timing", placeholder: "10:00 AM - 6:00 PM" },
                  { key: "registrationNumber", label: "Reg. No.", placeholder: "MCI-..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
                    <input type="text" placeholder={placeholder} value={(doctorForm as any)[key] || ""}
                      onChange={(e) => setDoctorForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Specialization</label>
                  <select value={doctorForm.specialization || ""} onChange={(e) => setDoctorForm(f => ({ ...f, specialization: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary bg-white">
                    <option value="">Select...</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">City</label>
                  <select value={doctorForm.city || ""} onChange={(e) => setDoctorForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary bg-white">
                    <option value="">Select...</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Gender</label>
                  <select value={doctorForm.gender || "Male"} onChange={(e) => setDoctorForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Experience (years)</label>
                  <input type="number" value={doctorForm.experience || 0} onChange={(e) => setDoctorForm(f => ({ ...f, experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Fee (₹)</label>
                  <input type="number" value={doctorForm.fee || 0} onChange={(e) => setDoctorForm(f => ({ ...f, fee: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={doctorForm.rating || 4.5} onChange={(e) => setDoctorForm(f => ({ ...f, rating: parseFloat(e.target.value) || 4.5 }))}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">About</label>
                <textarea rows={3} value={doctorForm.about || ""} onChange={(e) => setDoctorForm(f => ({ ...f, about: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Avatar URL</label>
                <input type="text" placeholder="https://..." value={doctorForm.avatar || ""}
                  onChange={(e) => setDoctorForm(f => ({ ...f, avatar: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex gap-4">
                {[["isVerified", "Verified"], ["isPremium", "Premium"], ["emergencyAvailable", "Emergency"]].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!(doctorForm as any)[k]} onChange={(e) => setDoctorForm(f => ({ ...f, [k]: e.target.checked }))} className="rounded" />
                    {l}
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Consultation Types</label>
                <div className="flex gap-3">
                  {[["clinic", "In-Clinic"], ["home", "Home Visit"]].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={doctorForm.consultationTypes?.includes(v) || false}
                        onChange={(e) => setDoctorForm(f => ({ ...f, consultationTypes: e.target.checked ? [...(f.consultationTypes || []), v] : (f.consultationTypes || []).filter(t => t !== v) }))} className="rounded" />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Google Maps URL</label>
                <input type="text" placeholder="https://maps.google.com/?q=..." value={doctorForm.location?.mapsUrl || ""}
                  onChange={(e) => setDoctorForm(f => ({ ...f, location: { ...(f.location || { lat: 0, lng: 0, mapsUrl: "" }), mapsUrl: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">Social Links</label>
                {[["instagram","Instagram"],["facebook","Facebook"],["linkedin","LinkedIn"],["youtube","YouTube"],["x","X (Twitter)"],["website","Website"],["whatsapp","WhatsApp"],["googleBusiness","Google Business"]].map(([k, l]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs w-28 text-muted-foreground shrink-0">{l}</span>
                    <input type="text" placeholder={k === "website" || k === "googleBusiness" ? "https://..." : "@handle or URL"}
                      value={doctorForm.socials?.[k] || ""}
                      onChange={(e) => setDoctorForm(f => ({ ...f, socials: { ...(f.socials || {}), [k]: e.target.value } }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={() => setShowDoctorForm(false)} className="flex-1 border border-border text-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveDoctor} disabled={saving}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : editingDoctor ? "Update Doctor" : "Add Doctor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
