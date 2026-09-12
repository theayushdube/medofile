import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Save, ShieldCheck, ImagePlus, Upload } from "lucide-react";
import { Navbar } from "@/components/Navbar";

type Form = {
  name: string; qualification: string; specialization: string; experience: string; fee: string;
  hospital: string; clinicName: string; address: string; city: string; phone: string; about: string;
  languages: string; availability: string; timing: string; registrationNumber: string; treatments: string;
  website: string; instagram: string; youtube: string; linkedin: string; consultationTypes: string;
  avatar: string; mapsUrl: string; education: string; memberships: string; insurances: string; branches: string;
  emergencyAvailable: boolean;
};

const empty: Form = {
  name: "", qualification: "", specialization: "General Physician", experience: "", fee: "500",
  hospital: "", clinicName: "", address: "", city: "", phone: "", about: "", languages: "",
  availability: "", timing: "", registrationNumber: "", treatments: "", website: "", instagram: "",
  youtube: "", linkedin: "", consultationTypes: "clinic", avatar: "", mapsUrl: "",
  education: "", memberships: "", insurances: "", branches: "", emergencyAvailable: false,
};

function inputValue(value: unknown) {
  return value == null ? "" : String(value);
}

function prepareAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDimension = 900;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error("Unable to prepare image")); return; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Unable to encode image")); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error("Unable to read image"));
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.84);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Unable to load image")); };
    image.src = objectUrl;
  });
}

export default function DoctorProfileManager() {
  const [, params] = useRoute("/doctor-profile/manage/:id");
  const [, navigate] = useLocation();
  const { user, isLoaded } = useUser();
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const id = params?.id;

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const query = new URLSearchParams(window.location.search);
    if (id === "new") {
      setForm((current) => ({ ...current, name: query.get("name") ?? "", phone: "", }));
      return;
    }
    fetch(`/api/doctors/${id}`).then((r) => r.ok ? r.json() : null).then((doctor) => {
      if (!doctor) return;
      setForm({
        name: inputValue(doctor.name), qualification: inputValue(doctor.qualification),
        specialization: inputValue(doctor.specialization), experience: inputValue(doctor.experience),
        fee: inputValue(doctor.fee), hospital: inputValue(doctor.hospital), clinicName: inputValue(doctor.clinicName),
        address: inputValue(doctor.address), city: inputValue(doctor.city), phone: inputValue(doctor.phone),
        about: inputValue(doctor.about), languages: (doctor.languages ?? []).join(", "),
        availability: inputValue(doctor.availability), timing: inputValue(doctor.timing),
        registrationNumber: inputValue(doctor.registrationNumber), treatments: (doctor.treatments ?? []).join(", "),
        website: doctor.socials?.website ?? "", instagram: doctor.socials?.instagram ?? "",
        youtube: doctor.socials?.youtube ?? "", linkedin: doctor.socials?.linkedin ?? "",
        consultationTypes: (doctor.consultationTypes ?? ["clinic"]).join(", "),
        avatar: inputValue(doctor.avatar), mapsUrl: doctor.location?.mapsUrl ?? "",
        education: (doctor.education ?? []).map((e: { degree?: string; college?: string; year?: number }) => `${e.degree ?? ""} | ${e.college ?? ""} | ${e.year ?? ""}`).join(", "),
        memberships: (doctor.memberships ?? []).join(", "), insurances: (doctor.insurances ?? []).join(", "),
        branches: (doctor.branches ?? []).map((b: { name?: string; address?: string; timing?: string }) => `${b.name ?? ""} | ${b.address ?? ""} | ${b.timing ?? ""}`).join(", "),
        emergencyAvailable: Boolean(doctor.emergencyAvailable),
      });
    });
  }, [id, isLoaded, navigate, user]);

  function setField(key: keyof Form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage("");
    const payload = {
      name: form.name, qualification: form.qualification, specialization: form.specialization,
      experience: Number(form.experience) || 0, fee: Number(form.fee) || 500, hospital: form.hospital,
      clinicName: form.clinicName, address: form.address, city: form.city, phone: form.phone, about: form.about,
      languages: form.languages.split(",").map((v) => v.trim()).filter(Boolean),
      availability: form.availability, timing: form.timing, registrationNumber: form.registrationNumber,
      treatments: form.treatments.split(",").map((v) => v.trim()).filter(Boolean),
      consultationTypes: form.consultationTypes.split(",").map((v) => v.trim()).filter(Boolean),
      avatar: form.avatar,
      location: { lat: 0, lng: 0, mapsUrl: form.mapsUrl },
      education: form.education.split(",").map((v) => {
        const [degree = "", college = "", year = ""] = v.split("|").map((x) => x.trim());
        return { degree, college, year: Number(year) || new Date().getFullYear() };
      }).filter((v) => v.degree),
      memberships: form.memberships.split(",").map((v) => v.trim()).filter(Boolean),
      insurances: form.insurances.split(",").map((v) => v.trim()).filter(Boolean),
      branches: form.branches.split(",").map((v) => {
        const [name = "", address = "", timing = ""] = v.split("|").map((x) => x.trim());
        return { name, address, timing };
      }).filter((v) => v.name),
      emergencyAvailable: form.emergencyAvailable,
      socials: { website: form.website, instagram: form.instagram, youtube: form.youtube, linkedin: form.linkedin },
    };
    const response = await fetch(id === "new" ? "/api/doctors/register" : `/api/doctors/${id}/profile`, {
      method: id === "new" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const doctor = await response.json();
      setMessage("Profile saved. Your updated details are now used across doctor cards, profiles, and AI suggestions.");
      if (id === "new") navigate(`/doctor-profile/manage/${doctor.id}`, { replace: true });
    } else {
      const error = await response.json().catch(() => ({}));
      setMessage(error.error ?? "Unable to save profile. Please check the required details.");
    }
    setSaving(false);
  }

  const fields: Array<[keyof Form, string, string, boolean?]> = [
    ["name", "Doctor name", "Dr. Your Name", true], ["qualification", "Qualification", "MBBS, MD"],
    ["specialization", "Specialization", "Cardiologist"], ["experience", "Experience (years)", "10"],
    ["fee", "Consultation fee (₹)", "500"], ["hospital", "Hospital", "Hospital name"],
    ["clinicName", "Clinic name", "Clinic name"], ["address", "Address", "Full clinic address"],
    ["city", "City", "Mumbai", true], ["phone", "Phone", "+91...", true],
    ["languages", "Languages", "English, Hindi"], ["availability", "Availability", "Mon-Sat"],
    ["timing", "Timing", "10:00 AM - 7:00 PM"], ["registrationNumber", "Registration number", "Medical council number"],
    ["treatments", "Treatments", "Acne care, General consultation"], ["consultationTypes", "Consultation types", "clinic, home"],
    ["website", "Website", "https://..."], ["instagram", "Instagram", "@handle"],
    ["youtube", "YouTube", "Channel name"], ["linkedin", "LinkedIn", "Profile name"],
     ["mapsUrl", "Google Maps URL", "https://maps.google.com/..."],
    ["education", "Education", "MBBS | AIIMS | 2015"], ["memberships", "Memberships", "IMA, Cardiology Society"],
    ["insurances", "Insurance accepted", "Star Health, HDFC Ergo"], ["branches", "Branches", "Main Clinic | Address | 10 AM - 2 PM"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Medofile</button>
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
            <div><h1 className="text-2xl font-bold text-foreground">Manage your doctor profile</h1><p className="text-sm text-muted-foreground mt-1">These details appear on your doctor card, full profile, bookings, and AI recommendations.</p></div>
          </div>
          <form onSubmit={save} className="mt-8">
            <div className="mb-6 rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center">
                  {form.avatar ? <img src={form.avatar} alt="Doctor profile preview" className="w-full h-full object-cover" /> : <ImagePlus className="w-7 h-7 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Profile image</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload a clear headshot. It will appear on your public profile, doctor cards, and AI recommendations.</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <label className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-primary/90">
                      <Upload className="w-4 h-4" /> {imageBusy ? "Preparing..." : "Upload image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={imageBusy}
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (!file) return;
                          setImageBusy(true);
                          try { setField("avatar", await prepareAvatar(file)); setMessage(""); }
                          catch { setMessage("Unable to prepare that image. Please choose a JPG, PNG, or WebP photo."); }
                          finally { setImageBusy(false); }
                        }}
                      />
                    </label>
                    {form.avatar && <button type="button" onClick={() => setField("avatar", "")} className="text-sm font-semibold text-muted-foreground hover:text-destructive">Remove image</button>}
                  </div>
                  <input value={form.avatar.startsWith("data:") ? "" : form.avatar} onChange={(event) => setField("avatar", event.target.value)} placeholder="Or paste an image URL" className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map(([key, label, placeholder, required]) => (
                <label key={key} className={`${key === "about" ? "sm:col-span-2" : ""} block text-sm font-medium text-foreground`}>
                  {label}{required && <span className="text-destructive"> *</span>}
                  {key === "about" ? (
                    <textarea required={required} value={form[key]} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} rows={4} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
                  ) : (
                    <input required={required} type={key === "experience" || key === "fee" ? "number" : "text"} value={String(form[key])} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
                  )}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-3 mt-5 text-sm font-medium text-foreground">
              <input type="checkbox" checked={form.emergencyAvailable} onChange={(e) => setForm((current) => ({ ...current, emergencyAvailable: e.target.checked }))} className="h-4 w-4 accent-primary" />
              Available for emergency consultations
            </label>
            <label className="block text-sm font-medium text-foreground mt-4">About you
              <textarea value={form.about} onChange={(e) => setField("about", e.target.value)} placeholder="Describe your experience, approach, and focus areas" rows={4} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
            <div className="flex items-center justify-between gap-4 mt-6">
              <p className={`text-sm ${message.startsWith("Profile saved") ? "text-emerald-600" : "text-destructive"}`}>{message}</p>
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-3 font-semibold disabled:opacity-50"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save profile"}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}