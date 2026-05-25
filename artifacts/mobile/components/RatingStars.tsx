import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}

export function RatingStars({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}: RatingStarsProps) {
  const colors = useColors();
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View style={styles.row}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Ionicons key={`full_${i}`} name="star" size={size} color="#F59E0B" />
      ))}
      {hasHalf && <Ionicons name="star-half" size={size} color="#F59E0B" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Ionicons key={`empty_${i}`} name="star-outline" size={size} color="#F59E0B" />
      ))}
      {showCount && reviewCount !== undefined && (
        <Text style={[styles.count, { color: colors.mutedForeground, fontSize: size }]}>
          {" "}
          {rating.toFixed(1)} ({reviewCount})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    fontFamily: "Inter_400Regular",
  },
});
