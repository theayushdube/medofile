import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { DOCTORS, TIME_SLOTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

type ConsultType = "clinic" | "video" | "home";

const CONSULT_OPTIONS: { type: ConsultType; label: string; icon: string; desc: string }[] = [
  { type: "clinic", label: "In-Clinic", icon: "medical-outline", desc: "Visit the clinic" },
  { type: "video", label: "Video Call", icon: "videocam-outline", desc: "Online consultation" },
  { type: "home", label: "Home Visit", icon: "home-outline", desc: "Doctor comes to you" },
];

function getDates() {
  const dates: { label: string; day: string; full: string }[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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
  const { addAppointment } = useApp();

  const doctor = DOCTORS.find((d) => d.id === doctorId) ?? DOCTORS[0];

  const [step, setStep] = useState(1);
  const [consultType, setConsultType] = useState<ConsultType>("clinic");
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleNext() {
    if (step === 1 && !selectedTime) {
      Alert.alert("Select Time", "Please select a time slot to continue.");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      confirmBooking();
    }
  }

  function confirmBooking() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAppointment({
      doctorId: doctor.id,
      patientName: "You",
      date: selectedDate,
      time: selectedTime!,
      type: consultType,
      status: "upcoming",
      branch: consultType === "clinic" ? doctor.branches[selectedBranch]?.name : undefined,
      fee: doctor.fee,
      notes: notes || undefined,
    });
    Alert.alert(
      "Appointment Confirmed",
      `Your appointment with ${doctor.name} is confirmed for ${selectedDate} at ${selectedTime}.`,
      [{ text: "Done", onPress: () => router.replace("/(patient)/appointments") }]
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
    steps: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 8,
    },
    stepBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
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
    docInfo: {
      marginLeft: 12,
    },
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
    datesRow: {
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    dateItem: {
      alignItems: "center",
      width: 56,
      paddingVertical: 10,
      borderRadius: colors.radius,
      borderWidth: 1,
      marginRight: 8,
    },
    dateDayLabel: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
    },
    dateDayNum: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      marginTop: 2,
    },
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
    timeSlotText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
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
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
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
    <View style={s.container}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Ionicons name="arrow-back" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>
          {step === 1 ? "Select Date & Time" : step === 2 ? "Consultation Type" : "Confirm Booking"}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          {step}/3
        </Text>
      </View>

      {/* Progress bars */}
      <View style={s.steps}>
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={[
              s.stepBar,
              { backgroundColor: n <= step ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Doctor mini-card */}
        <View style={s.docCard}>
          <Image source={{ uri: doctor.avatar }} style={s.docAvatar} contentFit="cover" />
          <View style={s.docInfo}>
            <Text style={s.docName}>{doctor.name}</Text>
            <Text style={s.docSpec}>{doctor.specialization}</Text>
            <Text style={s.feeLabel}>₹{doctor.fee} per consultation</Text>
          </View>
        </View>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <>
            <Text style={s.sectionTitle}>Select Date</Text>
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
                      backgroundColor:
                        selectedDate === d.full ? colors.primary : colors.card,
                      borderColor:
                        selectedDate === d.full ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedDate(d.full);
                    setSelectedTime(null);
                  }}
                >
                  <Text
                    style={[
                      s.dateDayLabel,
                      { color: selectedDate === d.full ? "rgba(255,255,255,0.8)" : colors.mutedForeground },
                    ]}
                  >
                    {d.label}
                  </Text>
                  <Text
                    style={[
                      s.dateDayNum,
                      { color: selectedDate === d.full ? "#fff" : colors.foreground },
                    ]}
                  >
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
                  <Text
                    style={[
                      s.timeSlotText,
                      { color: selectedTime === t ? "#fff" : colors.foreground },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Step 2: Consultation type */}
        {step === 2 && (
          <>
            <Text style={s.sectionTitle}>How would you like to consult?</Text>
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
                  <Text
                    style={[
                      s.consultLabel,
                      { color: consultType === o.type ? colors.primary : colors.foreground },
                    ]}
                  >
                    {o.label}
                  </Text>
                  <Text
                    style={[
                      s.consultDesc,
                      { color: consultType === o.type ? colors.primary : colors.mutedForeground },
                    ]}
                  >
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
                      <Text style={s.branchAddr}>{b.address}</Text>
                    </View>
                    {selectedBranch === i && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </>
            )}
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
                  {consultType === "clinic" ? "In-Clinic" : consultType === "video" ? "Video Call" : "Home Visit"}
                </Text>
              </View>
              {consultType === "clinic" && doctor.branches[selectedBranch] && (
                <View style={s.confirmRow}>
                  <Text style={s.confirmLabel}>Branch</Text>
                  <Text style={s.confirmValue}>{doctor.branches[selectedBranch].name}</Text>
                </View>
              )}
              <View style={s.divider} />
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Consultation Fee</Text>
                <Text style={s.totalValue}>₹{doctor.fee}</Text>
              </View>
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
    </View>
  );
}
