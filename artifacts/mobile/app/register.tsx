import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";

import { useApp, type UserRole } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { API_BASE_URL } from "@/constants/api";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUserRole, setPatientProfile, setActiveDoctorId } = useApp();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [role, setRole] = useState<UserRole>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("General Physician");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  async function continueRegistration() {
    if (!user) { router.push("/sign-up"); return; }
    if (!name.trim()) return;
    if (role === "doctor" && (!specialization.trim() || !city.trim() || !phone.trim())) return;
    if (role === "doctor") {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/doctors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: name.trim(), specialization: specialization.trim(), city: city.trim(), phone: phone.trim() }),
      });
      if (!response.ok) return;
      const doctor = await response.json();
      await setActiveDoctorId(String(doctor.id));
    }
    if (role === "patient") {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/me`, { method: "PUT", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ name: name.trim(), email: user.primaryEmailAddress?.emailAddress ?? email.trim(), phone }) });
      setPatientProfile({
        id: user.id,
        name: name.trim(),
        age: 0,
        gender: "",
        phone: "",
        email: email.trim(),
        bloodGroup: "",
      });
    }
    await setUserRole(role);
    router.replace(role === "doctor" ? "/(doctor)/dashboard" : "/(patient)/home");
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  return (
    <LinearGradient colors={["#0A3D8F", "#1B72E8", "#3B8FEF"]} style={styles.container}>
      <View style={[styles.content, { paddingTop: topPad + 24 }]}>
        <View style={styles.logo}><Ionicons name="medical" size={28} color={colors.primary} /></View>
        <Text style={styles.title}>Welcome to Medofile</Text>
        <Text style={styles.subtitle}>Tell us how you’ll use Medofile</Text>

        <View style={styles.roleRow}>
          {([
            { value: "patient" as const, icon: "person-outline" as const, title: "General user", sub: "Find doctors and book care" },
            { value: "doctor" as const, icon: "medkit-outline" as const, title: "Doctor", sub: "Manage your practice" },
          ]).map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setRole(option.value)}
              style={[styles.roleCard, role === option.value && styles.roleCardActive]}
            >
              <Ionicons name={option.icon} size={26} color={role === option.value ? colors.primary : "#55708F"} />
              <Text style={styles.roleTitle}>{option.title}</Text>
              <Text style={styles.roleSub}>{option.sub}</Text>
              {role === option.value && <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.check} />}
            </Pressable>
          ))}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Your name</Text>
          <TextInput value={name} onChangeText={setName} placeholder={role === "doctor" ? "Dr. Your Name" : "Your full name"} placeholderTextColor="#7B8FA8" style={styles.input} />
          <Text style={styles.label}>Email</Text>
          <TextInput value={user?.primaryEmailAddress?.emailAddress ?? email} onChangeText={setEmail} placeholder="Sign in to secure your care history" placeholderTextColor="#7B8FA8" keyboardType="email-address" autoCapitalize="none" style={styles.input} editable={!user} />
          {role === "doctor" && <>
            <Text style={styles.label}>Specialization</Text>
            <TextInput value={specialization} onChangeText={setSpecialization} placeholder="Cardiologist" placeholderTextColor="#7B8FA8" style={styles.input} />
            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} placeholder="Your city" placeholderTextColor="#7B8FA8" style={styles.input} />
            <Text style={styles.label}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="+91..." placeholderTextColor="#7B8FA8" keyboardType="phone-pad" style={styles.input} />
          </>}
          <Pressable disabled={!name.trim()} onPress={continueRegistration} style={[styles.button, !name.trim() && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>Continue as {role === "doctor" ? "Doctor" : "General User"}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.note}>You can update your profile details later.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  logo: { width: 62, height: 62, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 6, textAlign: "center" },
  roleRow: { flexDirection: "row", gap: 12, width: "100%", marginTop: 30 },
  roleCard: { flex: 1, minHeight: 145, padding: 16, borderRadius: 16, backgroundColor: "#fff", borderWidth: 2, borderColor: "transparent" },
  roleCardActive: { borderColor: "#00C897" },
  roleTitle: { marginTop: 14, fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#18324D" },
  roleSub: { marginTop: 5, fontSize: 11, lineHeight: 16, fontFamily: "Inter_400Regular", color: "#71839A" },
  check: { position: "absolute", top: 12, right: 12 },
  form: { width: "100%", backgroundColor: "#fff", padding: 18, borderRadius: 18, marginTop: 16 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#18324D", marginBottom: 6, marginTop: 4 },
  input: { height: 46, borderRadius: 11, backgroundColor: "#F4F7FC", paddingHorizontal: 13, color: "#18324D", fontFamily: "Inter_400Regular", marginBottom: 10 },
  button: { height: 48, borderRadius: 12, backgroundColor: "#00A982", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  note: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 16 },
});