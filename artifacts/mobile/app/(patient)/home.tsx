import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DoctorCard } from "@/components/DoctorCard";
import { SearchBar } from "@/components/SearchBar";
import { SpecializationChip } from "@/components/SpecializationChip";
import { useApp } from "@/context/AppContext";
import { DOCTORS, SPECIALIZATIONS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const QUICK_ACTIONS = [
  { label: "Near Me", icon: "location-outline", color: "#E53E3E" },
  { label: "Video Consult", icon: "videocam-outline", color: "#805AD5" },
  { label: "Home Visit", icon: "home-outline", color: "#DD6B20" },
  { label: "Emergency", icon: "medkit-outline", color: "#3182CE" },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { patientProfile } = useApp();
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((d) => {
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase());
      const matchSpec = !selectedSpec || d.specialization === selectedSpec;
      return matchSearch && matchSpec;
    });
  }, [search, selectedSpec]);

  const topRated = useMemo(() => DOCTORS.slice().sort((a, b) => b.rating - a.rating).slice(0, 3), []);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    greeting: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    name: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginTop: 2,
    },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    banner: {
      borderRadius: colors.radius,
      padding: 16,
      marginHorizontal: 20,
      marginVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bannerTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
      maxWidth: "70%",
    },
    bannerSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
      marginTop: 3,
    },
    bannerBtn: {
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    bannerBtnText: {
      fontSize: 12,
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
    },
    sectionPad: {
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
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
    quickActions: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      marginTop: 12,
    },
    qaItem: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qaLabel: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginTop: 5,
      textAlign: "center",
    },
    filterScroll: {
      paddingHorizontal: 20,
      paddingBottom: 4,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 10,
    },
    emptySubText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    listPad: {
      paddingHorizontal: 20,
      paddingBottom: botPad + 90,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>{patientProfile?.name ?? "Welcome"}</Text>
          </View>
          <Pressable style={styles.notifBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
          </Pressable>
        </View>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={search || selectedSpec ? filteredDoctors : DOCTORS}
        keyExtractor={(d) => d.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPad}
        scrollEnabled
        ListHeaderComponent={() => (
          <>
            <LinearGradient
              colors={["#1B72E8", "#0A4BAB"]}
              style={styles.banner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View>
                <Text style={styles.bannerTitle}>Find Verified Doctors Near You</Text>
                <Text style={styles.bannerSub}>Book in under 60 seconds</Text>
              </View>
              <Pressable style={styles.bannerBtn} onPress={() => router.push("/doctor/1")}>
                <Text style={styles.bannerBtnText}>Explore</Text>
              </Pressable>
            </LinearGradient>

            <View style={styles.quickActions}>
              {QUICK_ACTIONS.map((qa) => (
                <Pressable key={qa.label} style={styles.qaItem}>
                  <Ionicons name={qa.icon as any} size={22} color={qa.color} />
                  <Text style={styles.qaLabel}>{qa.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.sectionPad}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Specializations</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <SpecializationChip
                item={{ id: "all", name: "All", icon: "grid", color: colors.primary }}
                selected={!selectedSpec}
                onPress={() => setSelectedSpec(null)}
              />
              {SPECIALIZATIONS.map((s) => (
                <SpecializationChip
                  key={s.id}
                  item={s}
                  selected={selectedSpec === s.name}
                  onPress={() => setSelectedSpec(selectedSpec === s.name ? null : s.name)}
                />
              ))}
            </ScrollView>

            {!search && !selectedSpec && (
              <View style={styles.sectionPad}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Top Rated</Text>
                  <Text style={styles.seeAll}>See all</Text>
                </View>
                {topRated.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>All Doctors</Text>
                </View>
              </View>
            )}

            {(search || selectedSpec) && filteredDoctors.length === 0 && (
              <View style={[styles.sectionPad, styles.emptyContainer]}>
                <Feather name="search" size={40} color={colors.border} />
                <Text style={styles.emptyText}>No doctors found</Text>
                <Text style={styles.emptySubText}>Try a different search or filter</Text>
              </View>
            )}
          </>
        )}
        renderItem={({ item }) =>
          search || selectedSpec ? (
            <View style={styles.sectionPad}>
              <DoctorCard doctor={item} />
            </View>
          ) : (
            <View style={styles.sectionPad}>
              <DoctorCard doctor={item} />
            </View>
          )
        }
      />
    </View>
  );
}
