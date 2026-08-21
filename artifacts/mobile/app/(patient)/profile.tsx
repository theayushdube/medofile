import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, value, onPress, danger }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          backgroundColor: danger ? "#FFEBEE" : colors.secondary,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={danger ? "#C62828" : colors.primary}
        />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          fontFamily: "Inter_500Medium",
          color: danger ? "#C62828" : colors.foreground,
        }}
      >
        {label}
      </Text>
      {value && (
        <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginRight: 6 }}>
          {value}
        </Text>
      )}
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { patientProfile, appointments, logout } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const completedCount = appointments.filter((a) => a.status === "completed").length;

  function showComingSoon(label: string) {
    Alert.alert(label, "This section will be available in a future update.");
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    heroBg: {
      paddingTop: topPad,
      paddingBottom: 20,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      marginTop: 12,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.5)",
    },
    name: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    phone: {
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    statBox: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
    },
    statNum: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    statLabel: {
      fontSize: 11,
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_400Regular",
      marginTop: 2,
      textAlign: "center",
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    card: {
      marginHorizontal: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    guestCard: {
      margin: 16,
      padding: 18,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    guestTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    guestDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 6,
    },
    guestButton: {
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    guestButtonText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 90 }}
      >
        <LinearGradient
          colors={["#0A4BAB", "#1B72E8"]}
          style={styles.heroBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.name}>{patientProfile?.name ?? "Welcome to Medofile"}</Text>
          <Text style={styles.phone}>{patientProfile?.phone ?? "Browse doctors and care options as a guest"}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{patientProfile?.bloodGroup ?? "—"}</Text>
              <Text style={styles.statLabel}>Blood Group</Text>
            </View>
          </View>
        </LinearGradient>

        {patientProfile ? (
          <>
            <Text style={styles.sectionLabel}>Personal Details</Text>
            <View style={styles.card}>
              <MenuItem icon="person-outline" label="Full Name" value={patientProfile.name} />
              <MenuItem icon="call-outline" label="Phone" value={patientProfile.phone} />
              <MenuItem icon="mail-outline" label="Email" value={patientProfile.email} />
              <MenuItem icon="transgender-outline" label="Gender" value={patientProfile.gender} />
              <MenuItem icon="calendar-outline" label="Age" value={patientProfile.age.toString()} />
            </View>
          </>
        ) : (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Create your Medofile profile</Text>
            <Text style={styles.guestDescription}>Save your details to manage appointments and make booking quicker. You can continue browsing without an account.</Text>
            <Pressable style={styles.guestButton} onPress={() => router.push("/register")}>
              <Text style={styles.guestButtonText}>Register or continue as a doctor</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionLabel}>Health</Text>
        <View style={styles.card}>
          <MenuItem icon="water-outline" label="Blood Group" value={patientProfile?.bloodGroup} />
          <MenuItem icon="document-text-outline" label="Medical Records" onPress={() => showComingSoon("Medical Records")} />
          <MenuItem icon="fitness-outline" label="Health Reports" onPress={() => showComingSoon("Health Reports")} />
        </View>

        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.card}>
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => showComingSoon("Notifications")} />
          <MenuItem icon="lock-closed-outline" label="Privacy & Security" onPress={() => showComingSoon("Privacy & Security")} />
          <MenuItem icon="language-outline" label="Language" value="English" onPress={() => showComingSoon("Language")} />
          <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => showComingSoon("Help & Support")} />
          <MenuItem icon="information-circle-outline" label="About Medofile" onPress={() => showComingSoon("About Medofile")} />
        </View>

        {patientProfile && (
          <>
            <Text style={styles.sectionLabel}></Text>
            <View style={styles.card}>
              <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
