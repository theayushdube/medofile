import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ChevronLeft, Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, Building2, Home } from "lucide-react";
import { useDoctor } from "@/hooks/useDoctors";
import { Navbar } from "@/components/Navbar";

const TIME_SLOTS = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM"];
type ConsultType = "clinic" | "home";
const STEPS = ["Date & Time", "Your Details", "Confirm & Pay"];

function getDates() {
  const dates: { label: string; day: string; full: string; month: string }[] = [];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()],
      day: String(d.getDate()),
      month: months[d.getMonth()],
      full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    });
  }
  return dates;
}
const DATES = getDates();

export default function Booking() {
  const [, params] = useRoute("/book/:doctorId");
  const [, navigate] = useLocation();
  const { doctor, loading } = useDoctor(params?.doctorId);

  const [step, setStep] = useState(1);
  const [consultType, setConsultType] = useState<ConsultType>("clinic");
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientProblem, setPatientProblem] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleNext() {
    if (step === 1) {
      if (!selectedTime) { alert("Please select a time slot."); return; }
      setStep(2);
    } else if (step === 2) {
      const errs: Record<string, string> = {};
      if (!patientName.trim()) errs.name = "Name is required";
      if (!patientEmail.trim() || !patientEmail.includes("@")) errs.email = "Valid email required";
      if (!patientPhone.trim()) errs.phone = "Phone is required";
      if (!patientProblem.trim()) errs.problem = "Please describe your concern";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setErrors({});
      setStep(3);
    } else {
      if (!doctor) return;
      try {
        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: doctor.id,
            patientName,
            patientEmail,
            patientPhone,
            patientProblem,
            date: selectedDate,
            time: selectedTime!,
            type: consultType,
            branch: consultType === "clinic" ? doctor.branches[selectedBranch]?.name : "",
            fee: doctor.fee,
          }),
        });
      } catch {}
      setConfirmed(true);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground animate-pulse">Loading...</div>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="text-4xl">🔍</div>
        <div className="font-semibold text-foreground">Doctor not found</div>
        <button onClick={() => navigate("/doctors")} className="text-primary text-sm hover:underline">Browse doctors</button>
      </div>
    </div>
  );

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Appointment Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Your appointment with <strong>{doctor.name}</strong> is confirmed for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 mb-6 flex items-center gap-2.5">
            <Mail className="w-4 h-4 shrink-0" />
            A confirmation has been sent to <strong>{patientEmail}</strong>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 text-left mb-8 space-y-3">
            {[
              { label: "Doctor", value: doctor.name },
              { label: "Date", value: selectedDate },
              { label: "Time", value: selectedTime! },
              { label: "Type", value: consultType === "clinic" ? "In-Clinic" : "Home Visit" },
              { label: "Fee", value: `₹${doctor.fee}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/")} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(`/doctors/${doctor.id}`)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> {step > 1 ? "Back" : "Doctor Profile"}
        </button>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col gap-1.5 items-center">
              <div className={`w-full h-1.5 rounded-full transition-colors ${i + 1 <= step ? "bg-primary" : "bg-border"}`} />
              <span className={`text-xs font-medium ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Doctor card */}
        <div className="bg-white rounded-2xl border border-border p-4 flex gap-4 mb-6">
          <img src={doctor.avatar} alt={doctor.name} className="w-14 h-14 rounded-xl object-cover" />
          <div>
            <div className="font-semibold text-foreground">{doctor.name}</div>
            <div className="text-primary text-sm">{doctor.specialization}</div>
            <div className="text-muted-foreground text-sm mt-0.5">Consultation: <span className="font-semibold text-primary">₹{doctor.fee}</span></div>
          </div>
        </div>

        {/* Step 1: Date, Time & Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Consultation Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["clinic","home"] as ConsultType[]).filter(t => doctor.consultationTypes.includes(t)).map((t) => (
                  <button
                    key={t}
                    onClick={() => setConsultType(t)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${consultType === t ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}
                  >
                    {t === "clinic"
                      ? <Building2 className={`w-5 h-5 ${consultType === t ? "text-primary" : "text-muted-foreground"}`} />
                      : <Home className={`w-5 h-5 ${consultType === t ? "text-primary" : "text-muted-foreground"}`} />}
                    <span className={`text-xs font-medium ${consultType === t ? "text-primary" : "text-foreground"}`}>
                      {t === "clinic" ? "In-Clinic" : "Home Visit"}
                    </span>
                  </button>
                ))}
              </div>

              {consultType === "clinic" && doctor.branches.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-foreground text-sm mb-2">Select Branch</h3>
                  {doctor.branches.map((b, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedBranch(i)}
                      className={`w-full text-left p-3 rounded-xl border-2 mb-2 transition-all ${selectedBranch === i ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}
                    >
                      <div className="font-medium text-sm text-foreground">{b.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{b.address} • {b.timing}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Select Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {DATES.map((d) => (
                  <button
                    key={d.full}
                    onClick={() => { setSelectedDate(d.full); setSelectedTime(null); }}
                    className={`flex flex-col items-center min-w-14 py-3 px-2 rounded-xl border-2 transition-all ${selectedDate === d.full ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"}`}
                  >
                    <span className={`text-xs ${selectedDate === d.full ? "text-white/80" : "text-muted-foreground"}`}>{d.label}</span>
                    <span className={`text-lg font-bold mt-0.5 ${selectedDate === d.full ? "text-white" : "text-foreground"}`}>{d.day}</span>
                    <span className={`text-xs ${selectedDate === d.full ? "text-white/70" : "text-muted-foreground"}`}>{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Select Time Slot</h2>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedTime === t ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Patient details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Patient Details</h2>
            {[
              { key: "name", label: "Full Name", placeholder: "Enter your full name", icon: <User className="w-4 h-4" />, type: "text", value: patientName, set: setPatientName },
              { key: "email", label: "Email Address", placeholder: "your@email.com", icon: <Mail className="w-4 h-4" />, type: "email", value: patientEmail, set: setPatientEmail },
              { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210", icon: <Phone className="w-4 h-4" />, type: "tel", value: patientPhone, set: setPatientPhone },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {field.label} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{field.icon}</div>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors[field.key] ? "border-destructive" : "border-border"} bg-background text-foreground text-sm outline-none focus:border-primary transition-colors`}
                  />
                </div>
                {field.key === "email" && <p className="text-xs text-muted-foreground mt-1">📧 Confirmation will be sent here</p>}
                {errors[field.key] && <p className="text-xs text-destructive mt-1">{errors[field.key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Health Concern <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={patientProblem}
                  onChange={(e) => setPatientProblem(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={4}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.problem ? "border-destructive" : "border-border"} bg-background text-foreground text-sm outline-none focus:border-primary transition-colors resize-none`}
                />
              </div>
              {errors.problem && <p className="text-xs text-destructive mt-1">{errors.problem}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4">Booking Summary</h2>
              <div className="space-y-3">
                {[
                  { label: "Doctor", value: doctor.name },
                  { label: "Patient", value: patientName },
                  { label: "Date", value: selectedDate },
                  { label: "Time", value: selectedTime! },
                  { label: "Type", value: consultType === "clinic" ? "In-Clinic" : "Home Visit" },
                  consultType === "clinic" && doctor.branches[selectedBranch] ? { label: "Branch", value: doctor.branches[selectedBranch].name } : null,
                  { label: "Concern", value: patientProblem },
                ].filter(Boolean).map((row) => (
                  <div key={row!.label} className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground shrink-0">{row!.label}</span>
                    <span className="font-medium text-foreground text-right ml-4 max-w-xs">{row!.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="font-semibold text-foreground">Consultation Fee</span>
                  <span className="text-xl font-bold text-primary">₹{doctor.fee}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0" />
              Confirmation will be emailed to <strong>{patientEmail}</strong>
            </div>
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleNext}
          className="w-full mt-6 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          {step === 3 ? "Confirm Appointment" : "Continue"}
        </button>
      </div>
    </div>
  );
}
