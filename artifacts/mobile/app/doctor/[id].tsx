import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RatingStars } from "@/components/RatingStars";
import { useApp } from "@/context/AppContext";
import { DOCTORS } from "@/data/mockData";
import { API_BASE_URL } from "@/constants/api";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W } = Dimensions.get("window");

const TABS = ["Overview", "Reviews", "Services", "Gallery"] as const;
type Tab = (typeof TABS)[number];
type PublicReview = { id: string; patientName: string; rating: number; comment: string; date: string };

const SOCIAL_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "logo-instagram", color: "#E1306C", label: "Instagram" },
  facebook: { icon: "logo-facebook", color: "#1877F2", label: "Facebook" },
  youtube: { icon: "logo-youtube", color: "#FF0000", label: "YouTube" },
  linkedin: { icon: "logo-linkedin", color: "#0A66C2", label: "LinkedIn" },
  twitter: { icon: "logo-twitter", color: "#1DA1F2", label: "X / Twitter" },
  x: { icon: "logo-twitter", color: "#000000", label: "X" },
  website: { icon: "globe-outline", color: "#2E7D32", label: "Website" },
  whatsapp: { icon: "logo-whatsapp", color: "#25D366", label: "WhatsApp" },
  telegram: { icon: "paper-plane-outline", color: "#0088CC", label: "Telegram" },
  googleBusiness: { icon: "business-outline", color: "#4285F4", label: "Google Business" },
};

export default function DoctorProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleSaveDoctor, isDoctorSaved } = useApp();

  const doctor = DOCTORS.find((d) => d.id === id) ?? DOCTORS[0];
  const saved = isDoctorSaved(doctor.id);

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/doctors/${doctor.id}/reviews`)
      .then((response) => response.ok ? response.json() : [])
      .then((rows: Array<{ id: number; authorName: string; rating: number; comment: string; createdAt: string }>) => {
        if (!cancelled) setReviews(rows.map((row) => ({ id: String(row.id), patientName: row.authorName, rating: row.rating, comment: row.comment, date: new Date(row.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })));
      })
      .catch(() => !cancelled && setReviews([]));
    return () => { cancelled = true; };
  }, [doctor.id]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  function handleSave() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveDoctor(doctor.id);
  }

  function handleBook() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/book/${doctor.id}`);
  }

  function handleChat() {
    router.push(`/chat/${doctor.id}`);
  }

  function handleSocialPress(key: string, value: string) {
    const prefix: Record<string, string> = {
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/@",
      facebook: "https://facebook.com/",
      linkedin: "https://linkedin.com/in/",
      twitter: "https://x.com/",
      x: "https://x.com/",
      website: "https://",
      whatsapp: "https://wa.me/",
      telegram: "https://t.me/",
      googleBusiness: "https://g.co/kgs/",
    };
    const url = value.startsWith("http") ? value : `${prefix[key] ?? ""}${value.replace(/^[@]/, "")}`;
    Linking.openURL(url).catch(() => {});
  }

  function handleCall() {
    Linking.openURL(`tel:${doctor.phone}`).catch(() => {});
  }

  function handleDirections() {
    Linking.openURL(doctor.location.mapsUrl).catch(() => {});
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    stickyHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      paddingTop: topPad,
      paddingHorizontal: 16,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stickyTitle: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginLeft: 10,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    heroImg: {
      width: SCREEN_W,
      height: 230,
    },
    avatarRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 20,
      marginTop: -40,
      gap: 14,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderColor: colors.card,
      backgroundColor: colors.muted,
    },
    avatarInfo: {
      flex: 1,
      paddingBottom: 6,
    },
    docName: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    badges: {
      flexDirection: "row",
      gap: 5,
      marginTop: 4,
      flexWrap: "wrap",
    },
    badge: {
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    badgeText: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
    },
    specText: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
      marginTop: 3,
    },
    actionRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
      marginTop: 14,
    },
    saveBtn: {
      width: 44,
      height: 44,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    chatBtn: {
      flex: 1,
      height: 44,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      gap: 6,
    },
    chatBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    bookBtn: {
      flex: 2,
      height: 44,
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    bookBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    statVal: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    tabsContainer: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 3,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: colors.radius - 2,
    },
    tabText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
    },
    sectionPad: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 10,
    },
    aboutText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      width: 80,
    },
    infoValue: {
      flex: 1,
      fontSize: 13,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    socialGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    socialIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    socialIconRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    treatmentChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      margin: 3,
    },
    treatmentText: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    eduItem: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    eduDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    eduDegree: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    eduCollege: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },
    branchCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    branchName: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    branchAddr: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    branchTiming: {
      fontSize: 11,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
      marginTop: 4,
    },
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    reviewName: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    reviewDate: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    reviewText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
      marginTop: 6,
    },
    insuranceChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.muted,
      margin: 3,
    },
    insuranceText: {
      fontSize: 11,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    memberBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      margin: 3,
    },
    memberText: {
      fontSize: 11,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    consultTypeRow: {
      flexDirection: "row",
      gap: 8,
    },
    consultTypeChip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    consultTypeText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    emptyReviews: {
      alignItems: "center",
      paddingVertical: 30,
    },
    emptyReviewText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 8,
    },
  });

  const socials = Object.entries(doctor.socials).filter(([, v]) => v);

  return (
    <View style={s.container}>
      {/* Sticky header */}
      <Animated.View style={[s.stickyHeader, { opacity: headerOpacity }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.muted }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={s.stickyTitle} numberOfLines={1}>{doctor.name}</Text>
        <Pressable onPress={handleSave} hitSlop={10}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={saved ? colors.primary : colors.mutedForeground} />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 100 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero image */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: `https://picsum.photos/seed/clinic${doctor.id}/800/230` }}
            style={s.heroImg}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)"]}
            style={s.heroOverlay}
          />
          <Pressable
            style={[s.backBtn, { position: "absolute", top: topPad + 10, left: 16 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Avatar + name */}
        <View style={s.avatarRow}>
          <Image source={{ uri: doctor.avatar }} style={s.avatar} contentFit="cover" />
          <View style={s.avatarInfo}>
            <Text style={s.docName}>{doctor.name}</Text>
            <View style={s.badges}>
              {doctor.isVerified && (
                <View style={[s.badge, { backgroundColor: "#E8F5E9" }]}>
                  <Text style={[s.badgeText, { color: "#2E7D32" }]}>Verified</Text>
                </View>
              )}
              {doctor.isPremium && (
                <View style={[s.badge, { backgroundColor: "#FFF8E1" }]}>
                  <Text style={[s.badgeText, { color: "#E65100" }]}>Premium</Text>
                </View>
              )}
              {doctor.emergencyAvailable && (
                <View style={[s.badge, { backgroundColor: "#FFEBEE" }]}>
                  <Text style={[s.badgeText, { color: "#C62828" }]}>Emergency</Text>
                </View>
              )}
            </View>
            <Text style={s.specText}>{doctor.specialization}</Text>
          </View>
        </View>

        {/* Action buttons row 1: Call, WhatsApp, Directions, Save */}
        <View style={[s.actionRow, { marginBottom: 8 }]}>
          <Pressable
            style={[s.chatBtn, { flex: 1, backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }]}
            onPress={handleCall}
          >
            <Ionicons name="call-outline" size={16} color="#2E7D32" />
            <Text style={[s.chatBtnText, { color: "#2E7D32" }]}>Call</Text>
          </Pressable>
          <Pressable
            style={[s.chatBtn, { flex: 1, backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }]}
            onPress={() => handleSocialPress("whatsapp", doctor.socials.whatsapp ?? doctor.phone)}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            <Text style={[s.chatBtnText, { color: "#25D366" }]}>WhatsApp</Text>
          </Pressable>
          <Pressable
            style={[s.chatBtn, { flex: 1, borderColor: colors.border }]}
            onPress={handleDirections}
          >
            <Ionicons name="navigate-outline" size={16} color={colors.primary} />
            <Text style={[s.chatBtnText, { color: colors.primary }]}>Directions</Text>
          </Pressable>
          <Pressable style={s.saveBtn} onPress={handleSave}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={saved ? colors.primary : colors.foreground}
            />
          </Pressable>
        </View>

        {/* Social icon-only row — shown right below Call/WhatsApp/Directions */}
        {socials.length > 0 && (
          <View style={s.socialIconRow}>
            {socials.map(([key, value]) => {
              const info = SOCIAL_ICONS[key];
              if (!info) return null;
              return (
                <Pressable
                  key={key}
                  style={[s.socialIconBtn, { borderColor: `${info.color}40` }]}
                  onPress={() => handleSocialPress(key, value!)}
                  hitSlop={4}
                >
                  <Ionicons name={info.icon as any} size={20} color={info.color} />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Action buttons row 2: Chat, Book */}
        <View style={s.actionRow}>
          <Pressable style={s.chatBtn} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.foreground} />
            <Text style={s.chatBtnText}>Chat</Text>
          </Pressable>
          <Pressable style={s.bookBtn} onPress={handleBook}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={s.bookBtnText}>Book Appointment</Text>
          </Pressable>
        </View>

        {/* Quick stats */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statVal}>{doctor.experience}+</Text>
            <Text style={s.statLabel}>Yrs Exp</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{doctor.reviewCount}</Text>
            <Text style={s.statLabel}>Reviews</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{doctor.rating}</Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>₹{doctor.fee}</Text>
            <Text style={s.statLabel}>Fee</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabsContainer}>
          {TABS.map((t) => (
            <Pressable
              key={t}
              style={[
                s.tabItem,
                { backgroundColor: activeTab === t ? colors.card : "transparent" },
              ]}
              onPress={() => setActiveTab(t)}
            >
              <Text
                style={[
                  s.tabText,
                  { color: activeTab === t ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <>
            <View style={s.sectionPad}>
              <Text style={s.sectionTitle}>About</Text>
              <Text style={s.aboutText}>{doctor.about}</Text>
            </View>

            <View style={s.sectionPad}>
              <Text style={s.sectionTitle}>Details</Text>
              <View style={s.infoCard}>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Hospital</Text>
                  <Text style={s.infoValue}>{doctor.hospital || doctor.clinicName}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Address</Text>
                  <Text style={s.infoValue}>{doctor.address}, {doctor.city}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Timing</Text>
                  <Text style={s.infoValue}>{doctor.timing}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Languages</Text>
                  <Text style={s.infoValue}>{doctor.languages.join(", ")}</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Reg. No.</Text>
                  <Text style={s.infoValue}>{doctor.registrationNumber}</Text>
                </View>
              </View>
            </View>

            <View style={s.sectionPad}>
              <Text style={s.sectionTitle}>Consultation Types</Text>
              <View style={s.consultTypeRow}>
                {doctor.consultationTypes.map((t) => (
                  <View key={t} style={s.consultTypeChip}>
                    <Ionicons
                      name={t === "clinic" ? "medical-outline" : "home-outline"}
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={s.consultTypeText}>
                      {t === "clinic" ? "In-Clinic" : "Home Visit"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {doctor.branches.length > 0 && (
              <View style={s.sectionPad}>
                <Text style={s.sectionTitle}>Clinic Branches</Text>
                {doctor.branches.map((b, i) => (
                  <View key={i} style={s.branchCard}>
                    <Text style={s.branchName}>{b.name}</Text>
                    <Text style={s.branchAddr}>{b.address}</Text>
                    <Text style={s.branchTiming}>{b.timing}</Text>
                  </View>
                ))}
              </View>
            )}

            {doctor.education.length > 0 && (
              <View style={s.sectionPad}>
                <Text style={s.sectionTitle}>Education</Text>
                {doctor.education.map((e, i) => (
                  <View key={i} style={s.eduItem}>
                    <View style={s.eduDot} />
                    <View>
                      <Text style={s.eduDegree}>{e.degree}</Text>
                      <Text style={s.eduCollege}>{e.college} • {e.year}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {doctor.memberships.length > 0 && (
              <View style={s.sectionPad}>
                <Text style={s.sectionTitle}>Memberships</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {doctor.memberships.map((m, i) => (
                    <View key={i} style={s.memberBadge}>
                      <Text style={s.memberText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Social links are shown in the icon row above the tabs — no duplicate here */}

            {doctor.insurances.length > 0 && (
              <View style={s.sectionPad}>
                <Text style={s.sectionTitle}>Insurance Accepted</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {doctor.insurances.map((ins, i) => (
                    <View key={i} style={s.insuranceChip}>
                      <Text style={s.insuranceText}>{ins}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === "Reviews" && (
          <View style={s.sectionPad}>
            {reviews.length === 0 ? (
              <View style={s.emptyReviews}>
                <Ionicons name="star-outline" size={40} color={colors.border} />
                <Text style={s.emptyReviewText}>No reviews yet</Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <Text style={{ fontSize: 36, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                    {doctor.rating}
                  </Text>
                  <View>
                    <RatingStars rating={doctor.rating} reviewCount={doctor.reviewCount} />
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                      Based on {doctor.reviewCount} reviews
                    </Text>
                  </View>
                </View>
                {reviews.map((r) => (
                  <View key={r.id} style={s.reviewCard}>
                    <View style={s.reviewHeader}>
                      <Text style={s.reviewName}>{r.patientName}</Text>
                      <Text style={s.reviewDate}>{r.date}</Text>
                    </View>
                    <RatingStars rating={r.rating} showCount={false} size={12} />
                    <Text style={s.reviewText}>{r.comment}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === "Services" && (
          <View style={s.sectionPad}>
            <Text style={s.sectionTitle}>Treatments & Procedures</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {doctor.treatments.map((t, i) => (
                <View key={i} style={s.treatmentChip}>
                  <Text style={s.treatmentText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "Gallery" && (
          <View style={s.sectionPad}>
            <Text style={s.sectionTitle}>Clinic Gallery</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <Image
                  key={i}
                  source={{ uri: `https://picsum.photos/seed/gallery${doctor.id}${i}/200/200` }}
                  style={{
                    width: (SCREEN_W - 56) / 3,
                    height: (SCREEN_W - 56) / 3,
                    borderRadius: colors.radius,
                    backgroundColor: colors.muted,
                  }}
                  contentFit="cover"
                />
              ))}
            </View>
          </View>
        )}

        {/* Bottom Book button */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Pressable style={s.bookBtn} onPress={handleBook}>
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={[s.bookBtnText, { fontSize: 15 }]}>Book Appointment — ₹{doctor.fee}</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
