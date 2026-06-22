import { useState, useEffect } from "react";

export interface ApiDoctor {
  id: number; name: string; qualification: string; specialization: string;
  experience: number; rating: number; reviewCount: number; fee: number;
  hospital: string; clinicName: string; address: string; city: string;
  phone: string; about: string; languages: string[]; availability: string;
  isVerified: boolean; isPremium: boolean; emergencyAvailable: boolean;
  gender: "Male" | "Female"; consultationTypes: ("clinic" | "home")[];
  registrationNumber: string; avatar: string; timing: string;
  location: { lat: number; lng: number; mapsUrl: string };
  socials: Record<string, string>;
  analytics: { impressions: number; profileViews: number; callClicks: number; chatClicks: number; bookings: number; directionsClicks: number; weeklyTrend: number[] };
  treatments: string[]; education: { degree: string; college: string; year: number }[];
  memberships: string[]; insurances: string[];
  branches: { name: string; address: string; timing: string }[];
}

export type WebDoctor = Omit<ApiDoctor, "id"> & { id: string };

function normalize(d: ApiDoctor): WebDoctor {
  return { ...d, id: String(d.id) };
}

const cache: { doctors: WebDoctor[] | null; ts: number } = { doctors: null, ts: 0 };
const TTL = 60_000;

export function useDoctors() {
  const [doctors, setDoctors] = useState<WebDoctor[]>(() => cache.doctors ?? []);
  const [loading, setLoading] = useState(!cache.doctors);

  useEffect(() => {
    if (cache.doctors && Date.now() - cache.ts < TTL) {
      setDoctors(cache.doctors);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/doctors")
      .then((r) => r.ok ? r.json() : [])
      .then((data: ApiDoctor[]) => {
        if (!cancelled) {
          const normalized = data.map(normalize);
          cache.doctors = normalized;
          cache.ts = Date.now();
          setDoctors(normalized);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { doctors, loading };
}

export function useDoctor(id: string | undefined) {
  const [doctor, setDoctor] = useState<WebDoctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    if (cache.doctors) {
      const found = cache.doctors.find((d) => d.id === id);
      if (found) { setDoctor(found); setLoading(false); return; }
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/doctors/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: ApiDoctor | null) => {
        if (!cancelled) { setDoctor(data ? normalize(data) : null); setLoading(false); }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return { doctor, loading };
}
