import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "@/components/SearchBar";
import { useApp } from "@/context/AppContext";
import { DOCTORS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const PATIENT_NAMES = [
  "Rahul Gupta",
  "Anita Verma",
  "Mohan Singh",
  "Priya Sharma",
  "Suresh Kumar",
  "Kavya Reddy",
  "Amit Patel",
  "Neha Joshi",
];

const PATIENT_AVATARS = Array.from({ length: 8 }, (_, i) => `https://i.pravatar.cc/100?img=${i + 10}`);

interface PatientItem {
  id: string;
  name: string;
  avatar: string;
  lastVisit: string;
  condition: string;
  appointmentsCount: number;
}

const MOCK_PATIENTS: PatientItem[] = PATIENT_NAMES.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  avatar: PATIENT_AVATARS[i],
  lastVisit: `2025-0${(i % 5) + 1}-${10 + i}`,
  condition: ["Hypertension", "Diabetes", "Cardiac", "Follow-up", "Checkup", "Allergy", "Migraine", "Back Pain"][i],
  appointmentsCount: Math.floor(Math.random() * 8) + 1,
}));

export default function PatientsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = useMemo(
    () =>
      MOCK_PATIENTS.filter((p) =>
        !search || p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    countBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    countText: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    listContent: {
      padding: 16,
      paddingBottom: botPad + 90,
    },
    patientCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.muted,
    },
    info: {
      flex: 1,
      marginLeft: 12,
    },
    name: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    sub: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    condBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    condText: {
      fontSize: 10,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    actions: {
      flexDirection: "column",
      gap: 6,
    },
    actionBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Patients</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{MOCK_PATIENTS.length} total</Text>
          </View>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search patients..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[
          styles.listContent,
          filtered.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.patientCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                Last visit: {item.lastVisit} • {item.appointmentsCount} visits
              </Text>
              <View style={styles.condBadge}>
                <Text style={styles.condText}>{item.condition}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="call-outline" size={14} color={colors.primary} />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="document-text-outline" size={14} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="people-outline" size={52} color={colors.border} />
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        )}
      />
    </View>
  );
}
