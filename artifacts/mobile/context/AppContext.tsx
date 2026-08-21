import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useClerk, useUser } from "@clerk/expo";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { DOCTORS, type Appointment, type Doctor } from "@/data/mockData";
import { API_BASE_URL } from "@/constants/api";

export type UserRole = "patient" | "doctor" | null;

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
}

interface AppContextType {
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  activeDoctorId: string;
  savedDoctors: string[];
  appointments: Appointment[];
  isLoading: boolean;
  setUserRole: (role: UserRole) => Promise<void>;
  setActiveDoctorId: (id: string) => Promise<void>;
  setPatientProfile: (profile: PatientProfile) => void;
  toggleSaveDoctor: (doctorId: string) => Promise<void>;
  isDoctorSaved: (doctorId: string) => boolean;
  addAppointment: (apt: Omit<Appointment, "id">) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  getDoctorById: (id: string) => Doctor | undefined;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER_ROLE: "@medofile_role",
  PATIENT_PROFILE: "@medofile_patient",
  SAVED_DOCTORS: "@medofile_saved",
  APPOINTMENTS: "@medofile_appointments",
  ACTIVE_DOCTOR: "@medofile_active_doctor",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [patientProfile, setPatientProfileState] = useState<PatientProfile | null>(null);
  const [savedDoctors, setSavedDoctors] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeDoctorId, setActiveDoctorIdState] = useState("");

  useEffect(() => {
    async function loadState() {
      try {
        const [role, patient, saved, apts, doctorId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_DOCTORS),
          AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DOCTOR),
        ]);

        const parsedPatient = patient ? JSON.parse(patient) as PatientProfile : null;
        const isLegacyDemoProfile = parsedPatient?.id === "p1" && parsedPatient.name === "Arjun Mehta";
        if (isLegacyDemoProfile) {
          await AsyncStorage.removeItem(STORAGE_KEYS.PATIENT_PROFILE);
        }
        setPatientProfileState(isLegacyDemoProfile ? null : parsedPatient);
        setUserRoleState(
          role === "doctor"
            ? "doctor"
            : role === "patient" && parsedPatient && !isLegacyDemoProfile
              ? "patient"
              : null
        );
        if (saved) setSavedDoctors(JSON.parse(saved));
        if (apts) setAppointments(JSON.parse(apts));
        if (doctorId) setActiveDoctorIdState(doctorId);
      } catch {
    setUserRoleState(null);
    setPatientProfileState(null);
    setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  useEffect(() => {
    if (!isUserLoaded || !isSignedIn || !user) return;
    const currentUser = user;
    let cancelled = false;
    async function hydrateAccount() {
      try {
        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const [accountResponse, savedResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/me`, { headers }),
          fetch(`${API_BASE_URL}/me/saved-doctors`, { headers }),
          fetch(`${API_BASE_URL}/me/bookings`, { headers }),
        ]);
        if (cancelled || !accountResponse.ok) return;
        const account = await accountResponse.json();
        const saved = savedResponse.ok ? await savedResponse.json() : [];
        const bookingRows = bookingsResponse.ok ? await bookingsResponse.json() : [];
        if (cancelled) return;
        setUserRoleState(account.role === "doctor" ? "doctor" : "patient");
        setActiveDoctorIdState(account.doctorId ? String(account.doctorId) : "");
        setPatientProfileState({
          id: currentUser.id,
          name: account.profile?.name || currentUser.fullName || "",
          age: 0,
          gender: "",
          phone: account.profile?.phone || "",
          email: account.profile?.email || currentUser.primaryEmailAddress?.emailAddress || "",
          bloodGroup: "",
        });
        setSavedDoctors(Array.isArray(saved) ? saved.map((doctor: { id: number }) => String(doctor.id)) : []);
        setAppointments(Array.isArray(bookingRows) ? bookingRows.map((booking: any): Appointment => ({
          id: String(booking.id),
          doctorId: String(booking.doctorId),
          patientName: booking.patientName,
          patientEmail: booking.patientEmail,
          patientPhone: booking.patientPhone,
          patientProblem: booking.patientProblem,
          date: booking.date,
          time: booking.time,
          type: booking.type === "home" ? "home" : "clinic",
          status: booking.status === "completed" || booking.status === "cancelled" ? booking.status : "upcoming",
          branch: booking.branch,
          fee: booking.fee,
        })) : []);
      } catch {
        // Preserve the guest cache when the account cannot be reached.
      }
    }
    hydrateAccount();
    return () => { cancelled = true; };
  }, [getToken, isSignedIn, isUserLoaded, user]);

  const setActiveDoctorId = useCallback(async (id: string) => {
    setActiveDoctorIdState(id);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_DOCTOR, id);
  }, []);

  const setUserRole = useCallback(async (role: UserRole) => {
    setUserRoleState(role);
    if (role) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } else await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  }, []);

  const setPatientProfile = useCallback((profile: PatientProfile) => {
    setPatientProfileState(profile);
    AsyncStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profile));
  }, []);

  const toggleSaveDoctor = useCallback(async (doctorId: string) => {
    const alreadySaved = savedDoctors.includes(doctorId);
    if (isSignedIn) {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/me/saved-doctors/${doctorId}`, {
        method: alreadySaved ? "DELETE" : "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return;
    }
    setSavedDoctors((prev) => {
      const next = prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId];
      if (!isSignedIn) AsyncStorage.setItem(STORAGE_KEYS.SAVED_DOCTORS, JSON.stringify(next));
      return next;
    });
  }, [getToken, isSignedIn, savedDoctors]);

  const isDoctorSaved = useCallback(
    (doctorId: string) => savedDoctors.includes(doctorId),
    [savedDoctors]
  );

  const addAppointment = useCallback((apt: Omit<Appointment, "id">) => {
    const newApt: Appointment = {
      ...apt,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    };
    setAppointments((prev) => {
      const next = [newApt, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateAppointmentStatus = useCallback(
    (id: string, status: Appointment["status"]) => {
      setAppointments((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
        AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const getDoctorById = useCallback(
    (id: string) => DOCTORS.find((d) => d.id === id),
    []
  );

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.PATIENT_PROFILE,
      STORAGE_KEYS.SAVED_DOCTORS,
      STORAGE_KEYS.APPOINTMENTS,
      STORAGE_KEYS.ACTIVE_DOCTOR,
    ]);
    setUserRoleState(null);
    setPatientProfileState(null);
    setSavedDoctors([]);
    setAppointments([]);
    setActiveDoctorIdState("");
    if (isSignedIn) await signOut();
  }, [isSignedIn, signOut]);

  return (
    <AppContext.Provider
      value={{
        userRole,
        patientProfile,
        activeDoctorId,
        savedDoctors,
        appointments,
        isLoading,
        setUserRole,
    setActiveDoctorId,
        setPatientProfile,
        toggleSaveDoctor,
        isDoctorSaved,
        addAppointment,
        updateAppointmentStatus,
        getDoctorById,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
