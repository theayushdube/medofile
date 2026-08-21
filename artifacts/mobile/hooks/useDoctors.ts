import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/constants/api";
import type { Doctor } from "@/data/mockData";

interface ApiDoctor {
  id: number;
  name: string;
  qualification: string;
  specialization: string;
  experience: number;
  rating: number;
  reviewCount: number;
  fee: number;
  hospital: string;
  clinicName: string;
  address: string;
  city: string;
  phone: string;
  about: string;
  languages: string[];
  availability: string;
  timing: string;
  isAcceptingBookings: boolean;
  isVerified: boolean;
  isPremium: boolean;
  emergencyAvailable: boolean;
  gender: "Male" | "Female";
  consultationTypes: string[];
  registrationNumber: string;
  avatar: string;
  location: { lat: number; lng: number; mapsUrl: string };
  socials: Record<string, string>;
  analytics: {
    impressions: number; profileViews: number; callClicks: number;
    chatClicks: number; bookings: number; directionsClicks: number;
    weeklyTrend: number[];
  };
  treatments: string[];
  education: { degree: string; college: string; year: number }[];
  memberships: string[];
  insurances: string[];
  branches: { name: string; address: string; timing: string }[];
}

function normalize(d: ApiDoctor): Doctor {
  return {
    ...d,
    id: String(d.id),
    degrees: d.education?.map((e) => e.degree) ?? [],
    landmark: "",
    consultationTypes: d.consultationTypes.filter(
      (t): t is "clinic" | "home" | "video" => t === "clinic" || t === "home"
    ),
  } as Doctor;
}

export const doctorsCache: { data: Doctor[] | null; ts: number } = {
  data: null,
  ts: 0,
};
const TTL = 60_000;

export type DoctorSearchFilters = { q?: string; city?: string; specialization?: string; language?: string; gender?: string; consultationType?: string; minFee?: string; maxFee?: string; availability?: string; sort?: string };
export function useDoctors(filters: DoctorSearchFilters = {}) {
  const [doctors, setDoctors] = useState<Doctor[]>(() => doctorsCache.data ?? []);
  const [loading, setLoading] = useState(!doctorsCache.data);

  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    if (!hasFilters && doctorsCache.data && Date.now() - doctorsCache.ts < TTL) {
      setDoctors(doctorsCache.data);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    fetch(`${API_BASE_URL}/doctors${params.size ? `?${params.toString()}` : ""}`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((payload: { data?: ApiDoctor[] } | ApiDoctor[]) => {
        const data = Array.isArray(payload) ? payload : payload.data ?? [];
        if (!cancelled) {
          const normalized = data.map(normalize);
          if (!hasFilters) { doctorsCache.data = normalized; doctorsCache.ts = Date.now(); }
          setDoctors(normalized);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterKey]);

  return { doctors, loading };
}

export function useDoctor(id: string | undefined) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    if (doctorsCache.data) {
      const found = doctorsCache.data.find((d) => d.id === id);
      if (found) {
        setDoctor(found);
        setLoading(false);
        return;
      }
    }
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE_URL}/doctors/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ApiDoctor | null) => {
        if (!cancelled) {
          setDoctor(data ? normalize(data) : null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { doctor, loading };
}
