import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";

export default function SplashScreen() {
  const { isLoading, userRole } = useApp();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (userRole === "doctor") {
          router.replace("/(doctor)/dashboard");
        } else {
          router.replace("/(patient)/home");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userRole]);

  return (
    <LinearGradient
      colors={["#0A3D8F", "#1B72E8", "#3B8FEF"]}
      style={styles.container}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="medical" size={44} color="#1B72E8" />
        </View>

        <Text style={styles.appName}>Medofile</Text>
        <Text style={styles.tagline}>Your health, our priority</Text>

        <View style={styles.dotsRow}>
          {["Verified Doctors", "Instant Booking", "AI Health Assistant"].map((b) => (
            <View key={b} style={styles.badge}>
              <Ionicons name="checkmark-circle" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        Connecting patients &amp; doctors across India
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
  },
  dotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
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
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_500Medium",
  },
  footer: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
  },
});
