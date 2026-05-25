import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userRole, isLoading, setUserRole } = useApp();

  useEffect(() => {
    if (!isLoading && userRole) {
      if (userRole === "patient") {
        router.replace("/(patient)/home");
      } else {
        router.replace("/(doctor)/dashboard");
      }
    }
  }, [userRole, isLoading]);

  async function handleRoleSelect(role: "patient" | "doctor") {
    await setUserRole(role);
    if (role === "patient") {
      router.replace("/(patient)/home");
    } else {
      router.replace("/(doctor)/dashboard");
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: "#1B72E8" }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#0A4BAB", "#1B72E8", "#3B8FEF"]}
      style={[styles.container, { paddingTop: topPad + 20, paddingBottom: botPad + 20 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="medical" size={36} color="#1B72E8" />
        </View>
        <Text style={styles.appName}>MediConnect</Text>
        <Text style={styles.tagline}>
          Your complete healthcare platform — connect with doctors, book appointments,
          manage your health journey.
        </Text>
      </View>

      <View style={styles.badges}>
        {["Verified Doctors", "Instant Booking", "Video Consultation"].map((b) => (
          <View key={b} style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color="#A8D4FF" />
            <Text style={styles.badgeText}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cards}>
        <Text style={styles.chooseLabel}>I want to...</Text>

        <Pressable
          style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
          onPress={() => handleRoleSelect("patient")}
        >
          <View style={[styles.roleIconBg, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="person" size={28} color="#2E7D32" />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Find a Doctor</Text>
            <Text style={styles.roleDesc}>
              Search specialists, book appointments, consult online
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
          onPress={() => handleRoleSelect("doctor")}
        >
          <View style={[styles.roleIconBg, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="medkit" size={28} color="#1565C0" />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Doctor Portal</Text>
            <Text style={styles.roleDesc}>
              Manage your profile, appointments and patients
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </Pressable>
      </View>

      <Text style={styles.footer}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  badges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "Inter_500Medium",
  },
  cards: {
    gap: 12,
  },
  chooseLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    textAlign: "center",
  },
  roleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  roleIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#0D1B2A",
  },
  roleDesc: {
    fontSize: 12,
    color: "#6B7A94",
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  footer: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
