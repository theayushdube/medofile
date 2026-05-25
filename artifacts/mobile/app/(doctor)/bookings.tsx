import { Ionicons } from "@expo/vector-icons";
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

export default function DoctorBookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { appointments } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === (activeTab.toLowerCase() as Appointment["status"])
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
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 12,
    },
    badge: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
    },
    badgeText: {
      fontSize: 11,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Bookings</Text>
          {filtered.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filtered.length}</Text>
            </View>
          )}
        </View>
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
        renderItem={({ item }) => <AppointmentCard appointment={item} showActions={activeTab === "Upcoming"} />}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="calendar-outline" size={52} color={colors.border} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
          </View>
        )}
      />
    </View>
  );
}
