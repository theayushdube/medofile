import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DoctorCard } from "@/components/DoctorCard";
import { SpecializationChip } from "@/components/SpecializationChip";
import { useApp } from "@/context/AppContext";
import { DOCTORS, SPECIALIZATIONS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const QUICK_ACTIONS = [
  { label: "Home Visit", icon: "home-outline", color: "#DD6B20", bg: "#FFF3E0" },
  { label: "Emergency", icon: "medkit-outline", color: "#C62828", bg: "#FFEBEE" },
  { label: "Lab Tests", icon: "flask-outline", color: "#2E7D32", bg: "#E8F5E9" },
  { label: "AI Health Bot", icon: "sparkles-outline", color: "#1B72E8", bg: "#EFF6FF" },
];

const HEALTH_TIPS = [
  { tip: "Drink 8 glasses of water daily", icon: "water-outline", color: "#1B72E8" },
  { tip: "Walk 30 minutes every day", icon: "walk-outline", color: "#00C897" },
  { tip: "Sleep 7–8 hours each night", icon: "moon-outline", color: "#805AD5" },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { patientProfile } = useApp();

  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Detecting location...");
  const [locationLoading, setLocationLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Location fetch on mount
  React.useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "web") {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                setLocationText("Your Location");
                setLocationLoading(false);
              },
              () => {
                setLocationText("New Delhi, India");
                setLocationLoading(false);
              }
            );
          } else {
            setLocationText("New Delhi, India");
            setLocationLoading(false);
          }
          return;
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationText("New Delhi, India");
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (place) {
          setLocationText(`${place.city ?? place.district ?? "Your City"}, ${place.country ?? "India"}`);
        } else {
          setLocationText("Your Location");
        }
      } catch {
        setLocationText("New Delhi, India");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Tip rotation
  React.useEffect(() => {
    const t = setInterval(() => {
      setTipIndex((i) => (i + 1) % HEALTH_TIPS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q);
      const matchSpec = !selectedSpec || d.specialization === selectedSpec;
      return matchSearch && matchSpec;
    });
  }, [search, selectedSpec]);

  const topRated = useMemo(
    () => DOCTORS.slice().sort((a, b) => b.rating - a.rating).slice(0, 4),
    []
  );

  const tip = HEALTH_TIPS[tipIndex];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    locationLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    locationValue: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    chevron: { marginLeft: 2 },
    avatarBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    greetText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "right",
    },
    nameText: {
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      textAlign: "right",
    },
    avatarCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      padding: 0,
    },
    listContent: {
      paddingBottom: botPad + 90,
    },
    heroBanner: {
      marginHorizontal: 16,
      marginTop: 14,
      borderRadius: 16,
      overflow: "hidden",
    },
    heroGrad: {
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    heroTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      maxWidth: "55%",
    },
    heroSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    heroBtn: {
      backgroundColor: "#fff",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    heroBtnText: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    chatbotBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    chatbotIconBg: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    chatbotInfo: { flex: 1 },
    chatbotTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    chatbotSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    chatbotArrow: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginTop: 18,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    qaRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 8,
      marginTop: 2,
    },
    qaItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 5,
    },
    qaIconBg: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    qaLabel: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "center",
    },
    topDocScroll: {
      paddingLeft: 16,
      paddingRight: 4,
      paddingBottom: 4,
    },
    topDocCard: {
      width: 140,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      marginRight: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    topDocAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.muted,
      marginBottom: 8,
    },
    topDocName: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    topDocSpec: {
      fontSize: 10,
      color: colors.primary,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      marginTop: 2,
    },
    topDocRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: 4,
    },
    topDocRatingText: {
      fontSize: 11,
      color: "#F59E0B",
      fontFamily: "Inter_600SemiBold",
    },
    topDocFee: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    specScroll: {
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    allDocsPad: {
      paddingHorizontal: 16,
    },
    tipCard: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 10,
      backgroundColor: colors.secondary,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 16,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 10,
    },
  });

  const showFiltered = !!(search || selectedSpec);
  const name = patientProfile?.name ?? "there";
  const initial = name[0]?.toUpperCase() ?? "U";

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.topRow}>
          <Pressable style={s.locationRow} onPress={() => {}}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <View>
              <Text style={s.locationLabel}>Your Location</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 4 }} />
                ) : null}
                <Text style={s.locationValue} numberOfLines={1}>{locationText}</Text>
                <Ionicons name="chevron-down" size={12} color={colors.foreground} style={s.chevron} />
              </View>
            </View>
          </Pressable>
          <View style={s.avatarBtn}>
            <View>
              <Text style={s.greetText}>Hello,</Text>
              <Text style={s.nameText}>{name.split(" ")[0]}</Text>
            </View>
            <View style={s.avatarCircle}>
              <Text style={s.avatarInitial}>{initial}</Text>
            </View>
          </View>
        </View>

        {/* Search bar */}
        <Pressable
          style={s.searchRow}
          onPress={() => {}}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search doctors, specializations, city..."
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
          <Pressable
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
            onPress={() => {}}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>Search</Text>
          </Pressable>
        </Pressable>
      </View>

      <FlatList
        data={showFiltered ? filteredDoctors : []}
        keyExtractor={(d) => d.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={() => (
          <>
            {/* Hero Banner */}
            <View style={s.heroBanner}>
              <LinearGradient
                colors={["#1B72E8", "#0A4BAB"]}
                style={s.heroGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View>
                  <Text style={s.heroTitle}>Find & Book Verified Doctors</Text>
                  <Text style={s.heroSub}>1000+ specialists across India</Text>
                </View>
                <Pressable style={s.heroBtn} onPress={() => setSelectedSpec(null)}>
                  <Text style={s.heroBtnText}>Explore</Text>
                </Pressable>
              </LinearGradient>
            </View>

            {/* AI Health Chatbot Banner */}
            <Pressable
              style={s.chatbotBanner}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/healthbot");
              }}
            >
              <View style={s.chatbotIconBg}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </View>
              <View style={s.chatbotInfo}>
                <Text style={s.chatbotTitle}>AI Health Assistant</Text>
                <Text style={s.chatbotSub}>Ask symptoms • Get doctor suggestions</Text>
              </View>
              <View style={s.chatbotArrow}>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </Pressable>

            {/* Quick Actions */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Quick Access</Text>
            </View>
            <View style={s.qaRow}>
              {QUICK_ACTIONS.map((qa) => (
                <Pressable key={qa.label} style={s.qaItem}>
                  <View style={[s.qaIconBg, { backgroundColor: qa.bg }]}>
                    <Ionicons name={qa.icon as any} size={18} color={qa.color} />
                  </View>
                  <Text style={s.qaLabel}>{qa.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Health Tip */}
            <View style={s.tipCard}>
              <Ionicons name={tip.icon as any} size={18} color={tip.color} />
              <Text style={[s.tipText, { color: tip.color }]}>{tip.tip}</Text>
              <Ionicons name="bulb-outline" size={14} color={tip.color} />
            </View>

            {/* Top Rated Doctors horizontal scroll */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Top Rated</Text>
              <Text style={s.seeAll}>See all</Text>
            </View>
            <FlatList
              horizontal
              data={topRated}
              keyExtractor={(d) => d.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.topDocScroll}
              renderItem={({ item }) => (
                <Pressable
                  style={s.topDocCard}
                  onPress={() => router.push(`/doctor/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.avatar }}
                    style={s.topDocAvatar}
                    contentFit="cover"
                    transition={200}
                  />
                  <Text style={s.topDocName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.topDocSpec}>{item.specialization}</Text>
                  <View style={s.topDocRating}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={s.topDocRatingText}>{item.rating}</Text>
                  </View>
                  <Text style={s.topDocFee}>₹{item.fee}</Text>
                </Pressable>
              )}
            />

            {/* Specializations filter */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Browse by Specialty</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.specScroll}
            >
              <SpecializationChip
                item={{ id: "all", name: "All", icon: "grid", color: colors.primary }}
                selected={!selectedSpec}
                onPress={() => setSelectedSpec(null)}
              />
              {SPECIALIZATIONS.map((s2) => (
                <SpecializationChip
                  key={s2.id}
                  item={s2}
                  selected={selectedSpec === s2.name}
                  onPress={() => setSelectedSpec(selectedSpec === s2.name ? null : s2.name)}
                />
              ))}
            </ScrollView>

            {/* Section label */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>
                {showFiltered ? `Results (${filteredDoctors.length})` : "All Doctors"}
              </Text>
            </View>

            {showFiltered && filteredDoctors.length === 0 && (
              <View style={s.emptyContainer}>
                <Feather name="search" size={40} color={colors.border} />
                <Text style={s.emptyText}>No doctors found</Text>
              </View>
            )}

            {/* Non-filtered: show all doctors inline */}
            {!showFiltered &&
              DOCTORS.map((doc) => (
                <View key={doc.id} style={s.allDocsPad}>
                  <DoctorCard doctor={doc} />
                </View>
              ))}
          </>
        )}
        renderItem={({ item }) => (
          <View style={s.allDocsPad}>
            <DoctorCard doctor={item} />
          </View>
        )}
      />
    </View>
  );
}
