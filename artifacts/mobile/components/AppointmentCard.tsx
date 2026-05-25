import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

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
  const { getDoctorById, updateAppointmentStatus } = useApp();
  const doctor = getDoctorById(appointment.doctorId);

  if (!doctor) return null;

  const statusColor = STATUS_COLORS[appointment.status];

  function handleCancel() {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => updateAppointmentStatus(appointment.id, "cancelled"),
      },
    ]);
  }

  function handleReschedule() {
    router.push(`/book/${appointment.doctorId}`);
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
              : appointment.type === "video"
              ? "Video"
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
    </View>
  );
}
