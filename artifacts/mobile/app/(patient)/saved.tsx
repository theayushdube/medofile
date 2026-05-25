import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DoctorCard } from "@/components/DoctorCard";
import { useApp } from "@/context/AppContext";
import { DOCTORS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function SavedScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { savedDoctors } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const saved = useMemo(
    () => DOCTORS.filter((d) => savedDoctors.includes(d.id)),
    [savedDoctors]
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 12,
      paddingHorizontal: 20,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    listContent: {
      padding: 16,
      paddingBottom: botPad + 90,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginTop: 14,
    },
    emptySubText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 6,
      textAlign: "center",
      paddingHorizontal: 32,
    },
    browseBtn: {
      marginTop: 18,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    browseBtnText: {
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Doctors</Text>
        {saved.length > 0 && (
          <Text style={styles.subtitle}>{saved.length} doctor{saved.length !== 1 ? "s" : ""} saved</Text>
        )}
      </View>

      <FlatList
        data={saved}
        keyExtractor={(d) => d.id}
        contentContainerStyle={[
          styles.listContent,
          saved.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={saved.length > 0}
        renderItem={({ item }) => <DoctorCard doctor={item} />}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="bookmark-outline" size={56} color={colors.border} />
            <Text style={styles.emptyText}>No saved doctors yet</Text>
            <Text style={styles.emptySubText}>
              Browse doctors and tap the bookmark icon to save them for quick access
            </Text>
            <Pressable
              style={styles.browseBtn}
              onPress={() => router.push("/(patient)/home")}
            >
              <Text style={styles.browseBtnText}>Browse Doctors</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
