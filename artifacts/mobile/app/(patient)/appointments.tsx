import { Ionicons } from "@expo/vector-icons";
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

import { AppointmentCard } from "@/components/AppointmentCard";
import { useApp } from "@/context/AppContext";
import type { Appointment } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const TABS = ["Upcoming", "Completed", "Cancelled"] as const;
type TabType = (typeof TABS)[number];

export default function AppointmentsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointments } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === activeTab.toLowerCase() as Appointment["status"]
      ),
    [appointments, activeTab]
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
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 3,
      marginTop: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: colors.radius - 2,
      alignItems: "center",
    },
    tabText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
    },
    listContent: {
      padding: 16,
      paddingBottom: botPad + 90,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 12,
    },
    emptySubText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
      textAlign: "center",
    },
    bookBtn: {
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    bookBtnText: {
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.tab,
                { backgroundColor: activeTab === t ? colors.card : "transparent" },
              ]}
              onPress={() => setActiveTab(t)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === t ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={[
          styles.listContent,
          filtered.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={52} color={colors.border} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} appointments</Text>
            <Text style={styles.emptySubText}>
              {activeTab === "Upcoming"
                ? "Find a doctor and book your first appointment"
                : `Your ${activeTab.toLowerCase()} appointments will appear here`}
            </Text>
            {activeTab === "Upcoming" && (
              <Pressable
                style={styles.bookBtn}
                onPress={() => router.push("/(patient)/home")}
              >
                <Text style={styles.bookBtnText}>Find Doctors</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}
