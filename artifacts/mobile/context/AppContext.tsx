import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { DOCTORS, SAMPLE_APPOINTMENTS, type Appointment, type Doctor } from "@/data/mockData";

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
  setPatientProfile: (profile: PatientProfile) => void;
  toggleSaveDoctor: (doctorId: string) => void;
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
};

const DEFAULT_PATIENT: PatientProfile = {
  id: "p1",
  name: "Arjun Mehta",
  age: 32,
  gender: "Male",
  phone: "+91 98765 43210",
  email: "arjun.mehta@gmail.com",
  bloodGroup: "O+",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [patientProfile, setPatientProfileState] = useState<PatientProfile | null>(null);
  const [savedDoctors, setSavedDoctors] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [isLoading, setIsLoading] = useState(true);

  const activeDoctorId = "1";

  useEffect(() => {
    async function loadState() {
      try {
        const [role, patient, saved, apts] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE),
          AsyncStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_DOCTORS),
          AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS),
        ]);

        setUserRoleState(role === "doctor" || role === "patient" ? role : null);
        if (patient) setPatientProfileState(JSON.parse(patient));
        else setPatientProfileState(DEFAULT_PATIENT);
        if (saved) setSavedDoctors(JSON.parse(saved));
        if (apts) setAppointments(JSON.parse(apts));
      } catch {
        setPatientProfileState(DEFAULT_PATIENT);
      } finally {
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  const setUserRole = useCallback(async (role: UserRole) => {
    setUserRoleState(role);
    if (role) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    }
  }, []);

  const setPatientProfile = useCallback((profile: PatientProfile) => {
    setPatientProfileState(profile);
    AsyncStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profile));
  }, []);

  const toggleSaveDoctor = useCallback((doctorId: string) => {
    setSavedDoctors((prev) => {
      const next = prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId];
      AsyncStorage.setItem(STORAGE_KEYS.SAVED_DOCTORS, JSON.stringify(next));
      return next;
    });
  }, []);

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
      STORAGE_KEYS.SAVED_DOCTORS,
      STORAGE_KEYS.APPOINTMENTS,
    ]);
    setUserRoleState(null);
    setSavedDoctors([]);
    setAppointments(SAMPLE_APPOINTMENTS);
  }, []);

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
