import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { DOCTORS, TIME_SLOTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { API_BASE_URL } from "@/constants/api";

type ConsultType = "clinic" | "home";

const CONSULT_OPTIONS: { type: ConsultType; label: string; icon: string; desc: string }[] = [
  { type: "clinic", label: "In-Clinic", icon: "medical-outline", desc: "Visit the clinic" },
  { type: "home", label: "Home Visit", icon: "home-outline", desc: "Doctor comes to you" },
];

function getDates() {
  const dates: { label: string; day: string; full: string }[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()],
      day: String(d.getDate()),
      full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    });
  }
  return dates;
}

const DATES = getDates();

export default function BookScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const { addAppointment, patientProfile } = useApp();
  const { getToken, isSignedIn } = useAuth();

  const doctor = DOCTORS.find((d) => d.id === doctorId) ?? DOCTORS[0];

  const [step, setStep] = useState(1);
  const [consultType, setConsultType] = useState<ConsultType>("clinic");
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [patientName, setPatientName] = useState(patientProfile?.name ?? "");
  const [patientEmail, setPatientEmail] = useState(patientProfile?.email ?? "");
  const [patientPhone, setPatientPhone] = useState(patientProfile?.phone ?? "");
  const [patientProblem, setPatientProblem] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const STEPS = ["Date & Time", "Your Details", "Confirm"];

  function handleNext() {
    if (step === 1 && !selectedTime) {
      Alert.alert("Select Time", "Please select a time slot to continue.");
      return;
    }
    if (step === 2) {
      if (!patientName.trim()) {
        Alert.alert("Required", "Please enter your name.");
        return;
      }
      if (!patientEmail.trim() || !patientEmail.includes("@")) {
        Alert.alert("Required", "Please enter a valid email address.");
        return;
      }
      if (!patientPhone.trim()) {
        Alert.alert("Required", "Please enter your phone number.");
        return;
      }
      if (!patientProblem.trim()) {
        Alert.alert("Required", "Please describe your health concern.");
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      confirmBooking();
    }
  }

  async function confirmBooking() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let backendId: string | undefined;
    let bookingSaved = false;
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientName,
          patientEmail,
          patientPhone,
          patientProblem,
          date: selectedDate,
          time: selectedTime!,
          type: consultType,
          branch: consultType === "clinic" ? doctor.branches[selectedBranch]?.name || "" : "",
          fee: doctor.fee,
        }),
      });
      if (response.ok) {
        const created = await response.json();
        backendId = String(created.id);
        bookingSaved = true;
      }
    } catch {
      // Guests keep a local appointment if the network is unavailable.
    }
    if (isSignedIn && !bookingSaved) {
      Alert.alert("Booking not confirmed", "We could not save this appointment. Please check your connection and try again.");
      return;
    }
    addAppointment({
      id: backendId,
      doctorId: doctor.id,
      patientName,
      patientEmail,
      patientPhone,
      patientProblem,
      date: selectedDate,
      time: selectedTime!,
      type: consultType,
      status: "upcoming",
      branch: consultType === "clinic" ? doctor.branches[selectedBranch]?.name : undefined,
      fee: doctor.fee,
      notes: patientProblem || undefined,
    });
    Alert.alert(
      "Appointment Confirmed!",
      `Your appointment with ${doctor.name} is confirmed for ${selectedDate} at ${selectedTime}.\n\nA confirmation has been sent to ${patientEmail}.`,
      [{ text: "View Appointments", onPress: () => router.replace("/(patient)/appointments") }]
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 10,
      paddingHorizontal: 16,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    headerTitle: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      flex: 1,
    },
    stepIndicator: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      gap: 6,
    },
    stepItem: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    stepBar: {
      width: "100%",
      height: 3,
      borderRadius: 2,
    },
    stepLabel: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
    },
    docCard: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    docAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.muted,
    },
    docInfo: { marginLeft: 12, flex: 1 },
    docName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    docSpec: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    feeLabel: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    consultTypes: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 20,
    },
    consultItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: colors.radius,
      borderWidth: 1.5,
    },
    consultLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      marginTop: 6,
    },
    consultDesc: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    branchItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1.5,
    },
    branchName: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    branchAddr: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    datesRow: { paddingHorizontal: 16, paddingBottom: 4 },
    dateItem: {
      alignItems: "center",
      width: 56,
      paddingVertical: 10,
      borderRadius: colors.radius,
      borderWidth: 1,
      marginRight: 8,
    },
    dateDayLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
    dateDayNum: { fontSize: 17, fontFamily: "Inter_700Bold", marginTop: 2 },
    timeSlotsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 20,
    },
    timeSlot: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    timeSlotText: { fontSize: 12, fontFamily: "Inter_500Medium" },
    inputGroup: {
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    inputLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 6,
    },
    required: {
      color: "#E53E3E",
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    emailNote: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    confirmCard: {
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    confirmRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    confirmLabel: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    confirmValue: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "right",
      flex: 1,
      marginLeft: 12,
    },
    divider: { height: 1, backgroundColor: colors.border },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    totalValue: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    emailConfirmNote: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 16,
      marginTop: 12,
    },
    emailConfirmText: {
      flex: 1,
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_400Regular",
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: botPad + 12,
    },
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    nextBtnText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });

  const availTypes = doctor.consultationTypes;

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Ionicons name="arrow-back" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>
          {STEPS[step - 1]}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          {step}/3
        </Text>
      </View>

      {/* Progress bars */}
      <View style={s.stepIndicator}>
        {STEPS.map((label, i) => (
          <View key={label} style={s.stepItem}>
            <View
              style={[
                s.stepBar,
                { backgroundColor: i + 1 <= step ? colors.primary : colors.border },
              ]}
            />
            <Text
              style={[
                s.stepLabel,
                { color: i + 1 <= step ? colors.primary : colors.mutedForeground },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
        {/* Doctor mini-card */}
        <View style={s.docCard}>
          <Image source={{ uri: doctor.avatar }} style={s.docAvatar} contentFit="cover" />
          <View style={s.docInfo}>
            <Text style={s.docName}>{doctor.name}</Text>
            <Text style={s.docSpec}>{doctor.specialization} • {doctor.city}</Text>
            <Text style={s.feeLabel}>Consultation Fee: ₹{doctor.fee}</Text>
          </View>
        </View>

        {/* Step 1: Date, Time & Consult Type */}
        {step === 1 && (
          <>
            <Text style={s.sectionTitle}>Consultation Type</Text>
            <View style={s.consultTypes}>
              {CONSULT_OPTIONS.filter((o) => availTypes.includes(o.type)).map((o) => (
                <Pressable
                  key={o.type}
                  style={[
                    s.consultItem,
                    {
                      backgroundColor: consultType === o.type ? colors.secondary : colors.card,
                      borderColor: consultType === o.type ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setConsultType(o.type)}
                >
                  <Ionicons
                    name={o.icon as any}
                    size={22}
                    color={consultType === o.type ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={[s.consultLabel, { color: consultType === o.type ? colors.primary : colors.foreground }]}>
                    {o.label}
                  </Text>
                  <Text style={[s.consultDesc, { color: consultType === o.type ? colors.primary : colors.mutedForeground }]}>
                    {o.desc}
                  </Text>
                </Pressable>
              ))}
            </View>

            {consultType === "clinic" && doctor.branches.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Select Branch</Text>
                {doctor.branches.map((b, i) => (
                  <Pressable
                    key={i}
                    style={[
                      s.branchItem,
                      {
                        backgroundColor: selectedBranch === i ? colors.secondary : colors.card,
                        borderColor: selectedBranch === i ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedBranch(i)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.branchName}>{b.name}</Text>
                      <Text style={s.branchAddr}>{b.address} • {b.timing}</Text>
                    </View>
                    {selectedBranch === i && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </>
            )}

            <Text style={[s.sectionTitle, { marginTop: 4 }]}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.datesRow}
              style={{ marginBottom: 20 }}
            >
              {DATES.map((d) => (
                <Pressable
                  key={d.full}
                  style={[
                    s.dateItem,
                    {
                      backgroundColor: selectedDate === d.full ? colors.primary : colors.card,
                      borderColor: selectedDate === d.full ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => { setSelectedDate(d.full); setSelectedTime(null); }}
                >
                  <Text style={[s.dateDayLabel, { color: selectedDate === d.full ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                    {d.label}
                  </Text>
                  <Text style={[s.dateDayNum, { color: selectedDate === d.full ? "#fff" : colors.foreground }]}>
                    {d.day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={s.sectionTitle}>Select Time Slot</Text>
            <View style={s.timeSlotsGrid}>
              {TIME_SLOTS.map((t) => (
                <Pressable
                  key={t}
                  style={[
                    s.timeSlot,
                    {
                      backgroundColor: selectedTime === t ? colors.primary : colors.card,
                      borderColor: selectedTime === t ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[s.timeSlotText, { color: selectedTime === t ? "#fff" : colors.foreground }]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Step 2: Patient Details */}
        {step === 2 && (
          <>
            <View style={[s.inputGroup, { marginTop: 4 }]}>
              <Text style={s.inputLabel}>
                Full Name <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.input}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>
                Email Address <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.input}
                value={patientEmail}
                onChangeText={setPatientEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={s.emailNote}>Booking confirmation will be sent to this email</Text>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>
                Phone Number <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.input}
                value={patientPhone}
                onChangeText={setPatientPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>
                Health Concern / Problem <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={patientProblem}
                onChangeText={setPatientProblem}
                placeholder="Briefly describe your symptoms or reason for visit..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={4}
              />
            </View>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <>
            <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Booking Summary</Text>
            <View style={s.confirmCard}>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>Doctor</Text>
                <Text style={s.confirmValue}>{doctor.name}</Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>Patient</Text>
                <Text style={s.confirmValue}>{patientName}</Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>Date</Text>
                <Text style={s.confirmValue}>{selectedDate}</Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>Time</Text>
                <Text style={s.confirmValue}>{selectedTime}</Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>Type</Text>
                <Text style={s.confirmValue}>
                  {consultType === "clinic" ? "In-Clinic" : "Home Visit"}
                </Text>
              </View>
              {consultType === "clinic" && doctor.branches[selectedBranch] && (
                <View style={s.confirmRow}>
                  <Text style={s.confirmLabel}>Branch</Text>
                  <Text style={s.confirmValue}>{doctor.branches[selectedBranch].name}</Text>
                </View>
              )}
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>Concern</Text>
                <Text style={s.confirmValue} numberOfLines={2}>{patientProblem}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Consultation Fee</Text>
                <Text style={s.totalValue}>₹{doctor.fee}</Text>
              </View>
            </View>

            <View style={s.emailConfirmNote}>
              <Ionicons name="mail" size={16} color={colors.primary} />
              <Text style={s.emailConfirmText}>
                Confirmation will be sent to {patientEmail}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={s.footer}>
        <Pressable style={s.nextBtn} onPress={handleNext}>
          <Text style={s.nextBtnText}>
            {step === 3 ? "Confirm Appointment" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
