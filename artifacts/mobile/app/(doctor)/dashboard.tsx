import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppointmentCard } from "@/components/AppointmentCard";
import { StatCard } from "@/components/StatCard";
import { useApp } from "@/context/AppContext";
import { DOCTORS, REVIEWS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { useDoctor } from "@/hooks/useDoctors";

const QUICK_ACTIONS = [
  { label: "Add Slot", icon: "add-circle-outline", color: "#1B72E8" },
  { label: "Share Profile", icon: "share-outline", color: "#805AD5" },
  { label: "View Analytics", icon: "analytics-outline", color: "#DD6B20" },
  { label: "Manage Clinic", icon: "business-outline", color: "#2E7D32" },
];

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointments, activeDoctorId } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { doctor: apiDoctor } = useDoctor(activeDoctorId);
  const doctor = apiDoctor ?? useMemo(() => DOCTORS.find((d) => d.id === activeDoctorId) ?? DOCTORS[0], [activeDoctorId]);
  const upcoming = useMemo(() => appointments.filter((a) => a.status === "upcoming").slice(0, 3), [appointments]);
  const todayCount = upcoming.length;
  const totalPatients = appointments.length;
  const reviews = useMemo(() => REVIEWS.filter((r) => r.doctorId === activeDoctorId), [activeDoctorId]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    greet: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_400Regular",
    },
    drName: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    verifiedText: {
      fontSize: 11,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
    },
    notifBtn: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    statsGrid: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 20,
      marginTop: -16,
      marginBottom: 16,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    qaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    qaItem: {
      width: "47%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qaLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginRight: 12,
      width: 240,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewName: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    reviewText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 6,
      lineHeight: 17,
    },
    reviewStars: {
      flexDirection: "row",
      gap: 2,
      marginTop: 8,
    },
    emptyApt: {
      alignItems: "center",
      paddingVertical: 24,
    },
    emptyAptText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 8,
    },
    profileCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    specBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    specBadgeText: {
      fontSize: 11,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 90 }}
      >
        <LinearGradient
          colors={["#0A4BAB", "#1B72E8", "#3B8FEF"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greet}>Welcome back</Text>
              <Text style={styles.drName}>{doctor.name}</Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="shield-checkmark" size={12} color="#A8D4FF" />
                <Text style={styles.verifiedText}>{doctor.specialization} • Verified</Text>
              </View>
            </View>
            <Pressable style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <StatCard
            label="Today"
            value={todayCount}
            icon="calendar-outline"
            iconColor="#1B72E8"
            iconBg="#E8F1FD"
            trend="+2 from yesterday"
          />
          <StatCard
            label="Total Patients"
            value={totalPatients}
            icon="people-outline"
            iconColor="#805AD5"
            iconBg="#EDE7F6"
          />
          <StatCard
            label="Rating"
            value={doctor.rating}
            icon="star-outline"
            iconColor="#F59E0B"
            iconBg="#FFF8E1"
            trend={`${doctor.reviewCount} reviews`}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <Pressable onPress={() => router.push("/(doctor)/bookings")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {upcoming.length === 0 ? (
            <View style={styles.emptyApt}>
              <Ionicons name="calendar-outline" size={36} color={colors.border} />
              <Text style={styles.emptyAptText}>No upcoming appointments</Text>
            </View>
          ) : (
            upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} showActions={false} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.qaGrid}>
          {QUICK_ACTIONS.map((qa) => (
            <Pressable
              key={qa.label}
              style={styles.qaItem}
              onPress={() => {
                if (qa.label === "Manage Clinic") router.push("/(doctor)/edit");
                else if (qa.label === "View Analytics") Alert.alert("Analytics", "Detailed analytics will be available as profile activity grows.");
                else if (qa.label === "Share Profile") Alert.alert("Share Profile", `Share ${doctor.name}'s Medofile profile from the doctor profile page.`);
                else router.push("/(doctor)/bookings");
              }}
            >
              <Ionicons name={qa.icon as any} size={20} color={qa.color} />
              <Text style={styles.qaLabel}>{qa.label}</Text>
            </Pressable>
          ))}
        </View>

        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
            </View>
          </View>
        )}
        {reviews.length > 0 && (
          <FlatList
            horizontal
            data={reviews}
            keyExtractor={(r) => r.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewName}>{item.patientName}</Text>
                <View style={styles.reviewStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.rating ? "star" : "star-outline"}
                      size={12}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <Text style={styles.reviewText} numberOfLines={3}>
                  {item.comment}
                </Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}
