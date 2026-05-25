import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { DOCTORS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Inter_600SemiBold",
          color: colors.mutedForeground,
          paddingHorizontal: 20,
          paddingBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  icon?: string;
  multiline?: boolean;
  editable?: boolean;
  badge?: string;
}

function FieldRow({ label, value, onChangeText, icon, multiline, editable = true, badge }: FieldRowProps) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: multiline ? "flex-start" : "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={colors.mutedForeground}
          style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 2 }}
        >
          {label}
        </Text>
        {editable ? (
          <TextInput
            style={{
              fontSize: 14,
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              padding: 0,
              minHeight: multiline ? 60 : undefined,
            }}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            placeholderTextColor={colors.mutedForeground}
          />
        ) : (
          <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            {value}
          </Text>
        )}
      </View>
      {badge && (
        <View style={{ backgroundColor: "#E8F5E9", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, color: "#2E7D32", fontFamily: "Inter_600SemiBold" }}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeDoctorId, logout } = useApp();

  const doctor = DOCTORS.find((d) => d.id === activeDoctorId) ?? DOCTORS[0];

  const [about, setAbout] = useState(doctor.about);
  const [fee, setFee] = useState(String(doctor.fee));
  const [timing, setTiming] = useState(doctor.timing);
  const [website, setWebsite] = useState(doctor.socials.website ?? "");
  const [instagram, setInstagram] = useState(doctor.socials.instagram ?? "");
  const [youtube, setYoutube] = useState(doctor.socials.youtube ?? "");
  const [linkedin, setLinkedin] = useState(doctor.socials.linkedin ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleSave() {
    Alert.alert("Profile Updated", "Your profile changes have been saved.");
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
    headerGrad: {
      paddingTop: topPad + 10,
      paddingBottom: 24,
      alignItems: "center",
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 10,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.5)",
    },
    editAvatarBtn: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
    },
    doctorName: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    doctorSpec: {
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    verifiedText: {
      fontSize: 11,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter_500Medium",
    },
    saveBtn: {
      backgroundColor: colors.primary,
      marginHorizontal: 20,
      marginTop: 8,
      marginBottom: 12,
      paddingVertical: 14,
      borderRadius: colors.radius,
      alignItems: "center",
    },
    saveBtnText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
    logoutBtn: {
      marginHorizontal: 20,
      marginBottom: 10,
      paddingVertical: 14,
      borderRadius: colors.radius,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#FFCDD2",
      backgroundColor: "#FFEBEE",
    },
    logoutText: {
      color: "#C62828",
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
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
          style={styles.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: doctor.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.editAvatarBtn}>
              <Feather name="camera" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpec}>{doctor.qualification}</Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.verifiedText}>Verified Doctor</Text>
          </View>
        </LinearGradient>

        <Section title="Basic Information">
          <FieldRow label="Doctor Name" value={doctor.name} editable={false} icon="person-outline" />
          <FieldRow label="Specialization" value={doctor.specialization} editable={false} icon="medical-outline" />
          <FieldRow label="Registration No." value={doctor.registrationNumber} editable={false} icon="id-card-outline" badge="Verified" />
          <FieldRow label="Experience" value={`${doctor.experience} years`} editable={false} icon="time-outline" />
          <FieldRow label="Consultation Fee (₹)" value={fee} onChangeText={setFee} icon="card-outline" />
          <FieldRow label="Availability" value={timing} onChangeText={setTiming} icon="calendar-outline" />
          <FieldRow label="About" value={about} onChangeText={setAbout} icon="document-text-outline" multiline />
        </Section>

        <Section title="Clinic Details">
          <FieldRow label="Clinic Name" value={doctor.clinicName} editable={false} icon="business-outline" />
          <FieldRow label="Hospital" value={doctor.hospital} editable={false} icon="medkit-outline" />
          <FieldRow label="Address" value={doctor.address} editable={false} icon="location-outline" />
          <FieldRow label="City" value={doctor.city} editable={false} icon="map-outline" />
        </Section>

        <Section title="Digital Presence">
          <FieldRow label="Personal Website" value={website} onChangeText={setWebsite} icon="globe-outline" />
          <FieldRow label="Instagram" value={instagram} onChangeText={setInstagram} icon="logo-instagram" />
          <FieldRow label="YouTube Channel" value={youtube} onChangeText={setYoutube} icon="logo-youtube" />
          <FieldRow label="LinkedIn" value={linkedin} onChangeText={setLinkedin} icon="logo-linkedin" />
        </Section>

        <Section title="Languages">
          <FieldRow
            label="Languages Spoken"
            value={doctor.languages.join(", ")}
            editable={false}
            icon="language-outline"
          />
        </Section>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </Pressable>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
