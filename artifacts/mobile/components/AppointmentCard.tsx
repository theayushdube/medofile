import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@clerk/expo";

import { API_BASE_URL } from "@/constants/api";
import { useApp } from "@/context/AppContext";
import type { Appointment } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface AppointmentCardProps {
  appointment: Appointment;
  showActions?: boolean;
}

const STATUS_COLORS = {
  upcoming: { bg: "#E8F5E9", text: "#2E7D32" },
  completed: { bg: "#E3F2FD", text: "#1565C0" },
  cancelled: { bg: "#FFEBEE", text: "#C62828" },
};

const TYPE_ICON: Record<string, "videocam-outline" | "medical-outline" | "home-outline"> = {
  clinic: "medical-outline",
  video: "videocam-outline",
  home: "home-outline",
};

export function AppointmentCard({ appointment, showActions = true }: AppointmentCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { getDoctorById, updateAppointmentStatus, updateAppointment } = useApp();
  const { isSignedIn, getToken } = useAuth();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);
  const [savingReschedule, setSavingReschedule] = useState(false);
  const doctor = getDoctorById(appointment.doctorId);

  if (!doctor) return null;

  const statusColor = STATUS_COLORS[appointment.status];

  async function cancelAppointment() {
    if (isSignedIn) {
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/me/bookings/${appointment.id}/cancel`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!response.ok) throw new Error();
      } catch {
        Alert.alert("Couldn't cancel", "This appointment could not be cancelled. Please try again.");
        return;
      }
    }
    updateAppointmentStatus(appointment.id, "cancelled");
  }

  function handleCancel() {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => { void cancelAppointment(); },
      },
    ]);
  }

  function handleReschedule() {
    setNewDate(appointment.date); setNewTime(appointment.time); setRescheduleOpen(true);
  }

  async function saveReschedule() {
    if (!newDate.trim() || !newTime.trim()) return;
    setSavingReschedule(true);
    try {
      if (isSignedIn) {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/me/bookings/${appointment.id}/reschedule`, { method: "PUT", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ date: newDate.trim(), time: newTime.trim() }) });
        if (!response.ok) throw new Error();
        const updated = await response.json();
        updateAppointment(appointment.id, { date: updated.date, time: updated.time, status: updated.status });
      } else updateAppointment(appointment.id, { date: newDate.trim(), time: newTime.trim() });
      setRescheduleOpen(false);
    } catch {
      Alert.alert("Couldn't reschedule", "This appointment could not be updated. Please try again.");
    } finally { setSavingReschedule(false); }
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    top: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.muted,
    },
    docInfo: {
      flex: 1,
      marginLeft: 10,
    },
    docName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    specText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },
    statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      textTransform: "capitalize",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    details: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    detail: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    detailText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    actions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 10,
    },
    btnSecondary: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnSecondaryText: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    btnDanger: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      backgroundColor: "#FFEBEE",
    },
    btnDangerText: {
      fontSize: 13,
      color: "#C62828",
      fontFamily: "Inter_500Medium",
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Image
          source={{ uri: doctor.avatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.specText}>{doctor.specialization}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detail}>
          <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons
            name={TYPE_ICON[appointment.type]}
            size={13}
            color={colors.mutedForeground}
          />
          <Text style={styles.detailText}>
            {appointment.type === "clinic"
              ? "In-Clinic"
              : "Home Visit"}
          </Text>
        </View>
        <View style={styles.detail}>
          <Feather name="credit-card" size={13} color={colors.mutedForeground} />
          <Text style={styles.detailText}>₹{appointment.fee}</Text>
        </View>
      </View>

      {showActions && appointment.status === "upcoming" && (
        <View style={styles.actions}>
          <Pressable style={styles.btnSecondary} onPress={handleReschedule}>
            <Text style={styles.btnSecondaryText}>Reschedule</Text>
          </Pressable>
          <Pressable style={styles.btnDanger} onPress={handleCancel}>
            <Text style={styles.btnDangerText}>Cancel</Text>
          </Pressable>
        </View>
      )}
      <Modal visible={rescheduleOpen} transparent animationType="fade" onRequestClose={() => setRescheduleOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: colors.radius, padding: 20 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>Reschedule appointment</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 6 }}>Enter your preferred date and time. The clinic will use this updated request.</Text>
            <TextInput value={newDate} onChangeText={setNewDate} placeholder="Date, e.g. 2026-08-25" placeholderTextColor={colors.mutedForeground} style={{ marginTop: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 11, color: colors.foreground }} />
            <TextInput value={newTime} onChangeText={setNewTime} placeholder="Time, e.g. 10:30 AM" placeholderTextColor={colors.mutedForeground} style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 11, color: colors.foreground }} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <Pressable onPress={() => setRescheduleOpen(false)} style={{ flex: 1, alignItems: "center", padding: 11 }}><Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text></Pressable>
              <Pressable disabled={savingReschedule} onPress={() => void saveReschedule()} style={{ flex: 1, alignItems: "center", padding: 11, borderRadius: 9, backgroundColor: colors.primary, opacity: savingReschedule ? 0.6 : 1 }}><Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>{savingReschedule ? "Saving…" : "Update"}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
