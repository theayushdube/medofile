import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_BASE_URL } from "@/constants/api";
import { useColors } from "@/hooks/useColors";

type Timeline = {
  events: Array<{ id: number; title: string; detail: string; createdAt: string }>;
  documents: Array<{ id: number; title: string; note: string; kind: string; createdAt: string }>;
  followUps: Array<{ id: number; instructions: string; createdAt: string; doctor: { name: string } }>;
};
type Preferences = { inApp: boolean; email: boolean; push: boolean; whatsapp: boolean; reminderHours: number };

export default function CareScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSignedIn, getToken } = useAuth();
  const [timeline, setTimeline] = useState<Timeline>({ events: [], documents: [], followUps: [] });
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    const result: Record<string, string> = {};
    if (token) result.Authorization = `Bearer ${token}`;
    return result;
  }, [getToken]);

  const load = useCallback(async () => {
    if (!isSignedIn) { setLoading(false); return; }
    try {
      const auth = await headers();
      const [timelineResponse, preferenceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/me/timeline`, { headers: auth }),
        fetch(`${API_BASE_URL}/me/reminder-preferences`, { headers: auth }),
      ]);
      if (timelineResponse.ok) setTimeline(await timelineResponse.json());
      if (preferenceResponse.ok) setPreferences(await preferenceResponse.json());
    } finally { setLoading(false); }
  }, [headers, isSignedIn]);

  useEffect(() => { void load(); }, [load]);

  async function changePreference(key: keyof Pick<Preferences, "inApp" | "email" | "push" | "whatsapp">, value: boolean) {
    if (!preferences) return;
    const optimistic = { ...preferences, [key]: value };
    setPreferences(optimistic);
    try {
      const response = await fetch(`${API_BASE_URL}/me/reminder-preferences`, { method: "PUT", headers: { "Content-Type": "application/json", ...(await headers()) }, body: JSON.stringify({ [key]: value }) });
      if (!response.ok) throw new Error();
      setPreferences(await response.json());
    } catch {
      setPreferences(preferences);
      Alert.alert("Couldn't save preference", "Please check your connection and try again.");
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPad + 10, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: colors.card, borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", gap: 12, alignItems: "center" },
    back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.muted },
    title: { color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 20 },
    content: { padding: 16, gap: 14, paddingBottom: 40 },
    card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius, padding: 15 },
    cardTitle: { color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 },
    muted: { color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 5, lineHeight: 18 },
  });

  if (!isSignedIn) return <View style={styles.screen}><View style={styles.header}><Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={colors.foreground} /></Pressable><Text style={styles.title}>Your care</Text></View><View style={{ padding: 28, alignItems: "center" }}><Text style={[styles.cardTitle, { textAlign: "center" }]}>Sign in to see your secure care timeline</Text><Pressable onPress={() => router.push("/sign-in")} style={{ marginTop: 14, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: colors.radius }}><Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Sign in</Text></Pressable></View></View>;

  return <View style={styles.screen}><View style={styles.header}><Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color={colors.foreground} /></Pressable><View><Text style={styles.title}>Your care</Text><Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Timeline and appointment reminders</Text></View></View>{loading ? <View style={{ padding: 42 }}><ActivityIndicator color={colors.primary} /></View> : <ScrollView contentContainerStyle={styles.content}><View style={styles.card}><Text style={styles.cardTitle}>Appointment reminders</Text><Text style={styles.muted}>Delivery depends on the channels connected to your device or account.</Text>{preferences && (["inApp", "email", "push", "whatsapp"] as const).map((key) => <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 13 }}><Text style={{ color: colors.foreground, fontSize: 14, textTransform: key === "inApp" ? "none" : "capitalize" }}>{key === "inApp" ? "In-app" : key}</Text><Switch value={preferences[key]} onValueChange={(value) => void changePreference(key, value)} trackColor={{ true: colors.primary }} /></View>)}</View>{timeline.followUps.map((note) => <View key={note.id} style={[styles.card, { backgroundColor: "#F0FDFA", borderColor: "#99F6E4" }]}><Text style={[styles.cardTitle, { color: "#115E59" }]}>Care instructions from {note.doctor.name}</Text><Text style={[styles.muted, { color: "#115E59" }]}>{note.instructions}</Text></View>)}<View style={styles.card}><Text style={styles.cardTitle}>Care timeline</Text>{[...timeline.events, ...timeline.documents.map((document) => ({ id: -document.id, title: document.title, detail: document.note || (document.kind === "report" ? "Health report" : "Prescription"), createdAt: document.createdAt }))].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 20).map((item) => <View key={item.id} style={{ borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: 10, marginTop: 14 }}><Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{item.title}</Text><Text style={styles.muted}>{item.detail}</Text><Text style={[styles.muted, { fontSize: 11 }]}>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Text></View>) || <Text style={styles.muted}>Your bookings, records, and care instructions will appear here.</Text>}</View><View style={styles.card}><Text style={styles.cardTitle}>Records</Text><Text style={styles.muted}>Add health reports and prescription notes in your Medofile care space on the web. Secure file attachment support is being prepared for mobile.</Text></View></ScrollView>}</View>;
}