import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useApp } from "@/context/AppContext";
import type { Doctor } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface DoctorCardProps {
  doctor: Doctor;
  compact?: boolean;
}

export function DoctorCard({ doctor, compact = false }: DoctorCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { toggleSaveDoctor, isDoctorSaved } = useApp();
  const saved = isDoctorSaved(doctor.id);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.97, {}, () => {
      scale.value = withSpring(1);
    });
    router.push(`/doctor/${doctor.id}`);
  }

  function handleSave() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveDoctor(doctor.id);
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: compact ? 12 : 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: compact ? "center" : "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: compact ? 56 : 72,
      height: compact ? 56 : 72,
      borderRadius: compact ? 28 : 36,
      backgroundColor: colors.muted,
    },
    info: {
      flex: 1,
      marginLeft: 12,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    },
    name: {
      fontSize: compact ? 14 : 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    verifiedBadge: {
      backgroundColor: "#E8F5E9",
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    verifiedText: {
      fontSize: 10,
      color: "#2E7D32",
      fontFamily: "Inter_600SemiBold",
    },
    spec: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
      marginTop: 2,
    },
    hospital: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
      flexWrap: "wrap",
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    statText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    ratingText: {
      fontSize: 12,
      color: "#F59E0B",
      fontFamily: "Inter_600SemiBold",
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: compact ? 0 : 10,
    },
    feeChip: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    feeText: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    saveBtn: {
      padding: 4,
    },
    typeChips: {
      flexDirection: "row",
      gap: 4,
      marginTop: 6,
      flexWrap: "wrap",
    },
    typeChip: {
      backgroundColor: colors.muted,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    typeChipText: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
    },
    premiumBadge: {
      backgroundColor: "#FFF8E1",
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    premiumText: {
      fontSize: 10,
      color: "#E65100",
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <Animated.View style={animStyle}>
      <Pressable style={styles.card} onPress={handlePress}>
        <Image
          source={{ uri: doctor.avatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {doctor.name}
            </Text>
            {doctor.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            {doctor.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
          <Text style={styles.spec}>{doctor.specialization}</Text>
          <Text style={styles.hospital} numberOfLines={1}>
            {doctor.experience} yrs • {doctor.clinicName || doctor.hospital}
          </Text>
          {!compact && (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{doctor.rating}</Text>
                <Text style={styles.statText}>({doctor.reviewCount})</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                <Text style={styles.statText}>{doctor.city}</Text>
              </View>
            </View>
          )}
          {!compact && (
            <View style={styles.typeChips}>
              {doctor.consultationTypes.map((t) => (
                <View key={t} style={styles.typeChip}>
                  <Text style={styles.typeChipText}>
                    {t === "clinic" ? "In-Clinic" : t === "video" ? "Video" : "Home Visit"}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.footer}>
            <View style={styles.feeChip}>
              <Text style={styles.feeText}>₹{doctor.fee}</Text>
            </View>
            <Pressable style={styles.saveBtn} onPress={handleSave} hitSlop={10}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={18}
                color={saved ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
