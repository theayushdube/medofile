import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import type { Specialization } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface SpecializationChipProps {
  item: Specialization;
  selected: boolean;
  onPress: () => void;
}

export function SpecializationChip({ item, selected, onPress }: SpecializationChipProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      marginRight: 8,
    },
    label: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
    },
  });

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={(item.icon as any) || "medical"}
        size={13}
        color={selected ? "#fff" : item.color}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? "#fff" : colors.foreground },
        ]}
      >
        {item.name}
      </Text>
    </Pressable>
  );
}
