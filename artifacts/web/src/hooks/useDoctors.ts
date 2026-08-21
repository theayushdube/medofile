import { useEffect, useState } from "react";

export interface ApiDoctor {
  id: number; name: string; qualification: string; specialization: string;
  experience: number; rating: number; reviewCount: number; fee: number;
  hospital: string; clinicName: string; address: string; city: string;
  phone: string; about: string; languages: string[]; availability: string; timing: string;
  isAcceptingBookings: boolean; isVerified: boolean; isPremium: boolean; emergencyAvailable: boolean;
  gender: "Male" | "Female"; consultationTypes: ("clinic" | "home")[];
  registrationNumber: string; avatar: string;
  location: { lat: number; lng: number; mapsUrl: string };
  socials: Record<string, string>;
  analytics: { impressions: number; profileViews: number; callClicks: number; chatClicks: number; bookings: number; directionsClicks: number; weeklyTrend: number[] };
  treatments: string[]; education: { degree: string; college: string; year: number }[];
  memberships: string[]; insurances: string[];
  branches: { name: string; address: string; timing: string }[];
}

export type WebDoctor = Omit<ApiDoctor, "id"> & { id: string };
export type DoctorSearchFilters = {
  q?: string; city?: string; specialization?: string; language?: string; gender?: string;
  consultationType?: string; minFee?: string; maxFee?: string; availability?: string; sort?: string;
};

function normalize(doctor: ApiDoctor): WebDoctor {
  return { ...doctor, id: String(doctor.id) };
}

const cache: { doctors: WebDoctor[] | null; ts: number } = { doctors: null, ts: 0 };
const TTL = 60_000;

export function useDoctors(filters: DoctorSearchFilters = {}) {
  const [doctors, setDoctors] = useState<WebDoctor[]>(() => cache.doctors ?? []);
  const [loading, setLoading] = useState(true);
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    if (!hasFilters && cache.doctors && Date.now() - cache.ts < TTL) {
      setDoctors(cache.doctors);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    fetch(`/api/doctors${params.size ? `?${params.toString()}` : ""}`)
      .then((response) => response.ok ? response.json() : { data: [] })
      .then((payload: { data?: ApiDoctor[] } | ApiDoctor[]) => {
        const records = Array.isArray(payload) ? payload : payload.data ?? [];
        const normalized = records.map(normalize);
        if (cancelled) return;
        if (!hasFilters) { cache.doctors = normalized; cache.ts = Date.now(); }
        setDoctors(normalized);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filterKey]);

  return { doctors, loading };
}

export function useDoctor(id: string | undefined) {
  const [doctor, setDoctor] = useState<WebDoctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const cached = cache.doctors?.find((item) => item.id === id);
    if (cached) { setDoctor(cached); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/doctors/${id}`)
      .then((response) => response.ok ? response.json() : null)
      .then((record: ApiDoctor | null) => {
        if (!cancelled) { setDoctor(record ? normalize(record) : null); setLoading(false); }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return { doctor, loading };
}