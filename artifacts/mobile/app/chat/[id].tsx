import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DOCTORS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  status: "sent" | "read";
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    text: "Hello! I wanted to ask about my recent test results and whether I need to make any dietary changes.",
    isMe: true,
    time: "10:30 AM",
    status: "read",
  },
  {
    id: "m2",
    text: "Hello! I reviewed your reports. Your cholesterol levels are slightly elevated. I would recommend reducing saturated fats and increasing fiber intake.",
    isMe: false,
    time: "10:35 AM",
    status: "read",
  },
  {
    id: "m3",
    text: "Should I be concerned? Do I need medication?",
    isMe: true,
    time: "10:36 AM",
    status: "read",
  },
  {
    id: "m4",
    text: "Not immediately. Let us try lifestyle changes for 3 months first — regular exercise, a heart-healthy diet, and avoid processed foods. Schedule a follow-up in 3 months.",
    isMe: false,
    time: "10:40 AM",
    status: "read",
  },
  {
    id: "m5",
    text: "Thank you doctor. I will follow your advice.",
    isMe: true,
    time: "10:41 AM",
    status: "read",
  },
];

const DOCTOR_QUICK_REPLIES = [
  "Please share your reports",
  "Schedule a follow-up visit",
  "You can book an appointment",
  "Take prescribed medicines regularly",
];

export default function ChatScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctor = DOCTORS.find((d) => d.id === id) ?? DOCTORS[0];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  function sendMessage(text: string) {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages((prev) => [newMsg, ...prev]);
    setInput("");

    // Simulated reply after 1.5s
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. I will review this and get back to you shortly. Please ensure you follow the prescribed treatment plan.",
        isMe: false,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setMessages((prev) => [reply, ...prev]);
    }, 1500);
  }

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      return (
        <View
          style={[
            s.msgRow,
            { justifyContent: item.isMe ? "flex-end" : "flex-start" },
          ]}
        >
          {!item.isMe && (
            <Image
              source={{ uri: doctor.avatar }}
              style={s.msgAvatar}
              contentFit="cover"
            />
          )}
          <View
            style={[
              s.bubble,
              {
                backgroundColor: item.isMe ? colors.primary : colors.card,
                borderBottomRightRadius: item.isMe ? 4 : colors.radius,
                borderBottomLeftRadius: item.isMe ? colors.radius : 4,
                borderWidth: item.isMe ? 0 : 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                s.bubbleText,
                { color: item.isMe ? "#fff" : colors.foreground },
              ]}
            >
              {item.text}
            </Text>
            <View style={s.msgMeta}>
              <Text
                style={[
                  s.msgTime,
                  { color: item.isMe ? "rgba(255,255,255,0.65)" : colors.mutedForeground },
                ]}
              >
                {item.time}
              </Text>
              {item.isMe && (
                <Ionicons
                  name={item.status === "read" ? "checkmark-done" : "checkmark"}
                  size={12}
                  color={item.status === "read" ? "#A8D4FF" : "rgba(255,255,255,0.6)"}
                />
              )}
            </View>
          </View>
        </View>
      );
    },
    [colors, doctor.avatar]
  );

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 8,
      paddingHorizontal: 12,
      paddingBottom: 10,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 9,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.muted,
    },
    headerInfo: {
      flex: 1,
    },
    headerName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    headerStatus: {
      fontSize: 11,
      color: colors.accent,
      fontFamily: "Inter_400Regular",
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerActionBtn: {
      width: 34,
      height: 34,
      borderRadius: 9,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexGrow: 1,
    },
    msgRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 8,
      gap: 6,
    },
    msgAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.muted,
      marginBottom: 4,
    },
    bubble: {
      maxWidth: "75%",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: colors.radius,
    },
    bubbleText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      lineHeight: 20,
    },
    msgMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: 4,
      justifyContent: "flex-end",
    },
    msgTime: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
    },
    quickReplies: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    quickReplyChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.secondary,
      marginRight: 8,
    },
    quickReplyText: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      paddingBottom: botPad > 0 ? botPad : 10,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      maxHeight: 100,
    },
    attachBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color={colors.foreground} />
        </Pressable>
        <Image source={{ uri: doctor.avatar }} style={s.headerAvatar} contentFit="cover" />
        <View style={s.headerInfo}>
          <Text style={s.headerName}>{doctor.name}</Text>
          <Text style={s.headerStatus}>Online</Text>
        </View>
        <View style={s.headerActions}>
          <Pressable style={s.headerActionBtn}>
            <Ionicons name="call-outline" size={16} color={colors.foreground} />
          </Pressable>
          <Pressable style={s.headerActionBtn}>
            <Ionicons name="videocam-outline" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {/* Quick replies */}
        <View style={s.quickReplies}>
          <FlatList
            horizontal
            data={DOCTOR_QUICK_REPLIES}
            keyExtractor={(r) => r}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable style={s.quickReplyChip} onPress={() => sendMessage(item)}>
                <Text style={s.quickReplyText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        <View style={s.inputRow}>
          <Pressable style={s.attachBtn}>
            <Feather name="paperclip" size={16} color={colors.mutedForeground} />
          </Pressable>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            style={[s.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Ionicons
              name="send"
              size={16}
              color={input.trim() ? "#fff" : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
