import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  role: "user" | "assistant";
  content: string;
  suggestedDoctors?: string[];
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your MediConnect AI Health Assistant. I can help you with:\n\n• Health questions and symptoms\n• Finding the right specialist\n• General wellness advice\n• Doctor recommendations near you\n\nHow can I help you today?",
};

const QUICK_PROMPTS = [
  "I have chest pain and shortness of breath",
  "My child has fever since 2 days",
  "I need a skin specialist in Mumbai",
  "What are symptoms of diabetes?",
  "Back pain after long sitting",
  "I feel anxious and stressed",
];

function extractDoctorMentions(text: string): string[] {
  return DOCTORS.filter((d) =>
    text.toLowerCase().includes(d.name.toLowerCase().split(" ").pop()!.toLowerCase())
  ).map((d) => d.id);
}

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

export default function HealthBotScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<boolean>(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInput("");

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
      };

      const assistantId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [assistantMsg, userMsg, ...prev]);
      setStreaming(true);
      abortRef.current = false;

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: trimmed });

      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) throw new Error("Server error");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          if (abortRef.current) break;
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                accumulated += data.content;
                const doctorIds = extractDoctorMentions(accumulated);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: accumulated, suggestedDoctors: doctorIds }
                      : m
                  )
                );
              }
            } catch {}
          }
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I'm having trouble connecting right now. Please check your connection and try again.",
                }
              : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 14,
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
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    botAvatarBg: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerInfo: { flex: 1 },
    headerTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    headerSub: {
      fontSize: 11,
      color: colors.accent,
      fontFamily: "Inter_400Regular",
    },
    listContent: {
      padding: 14,
      paddingBottom: 8,
      flexGrow: 1,
    },
    msgRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 10,
      gap: 8,
    },
    botIcon: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    bubble: {
      maxWidth: "80%",
      padding: 12,
      borderRadius: 16,
    },
    userBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Inter_400Regular",
    },
    cursor: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    doctorSuggestions: {
      marginTop: 10,
      gap: 6,
    },
    docSugLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 2,
    },
    docSugCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    docSugAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
    },
    docSugName: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    docSugSpec: {
      fontSize: 10,
      color: colors.primary,
      fontFamily: "Inter_400Regular",
    },
    docSugFee: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    docSugBookBtn: {
      marginLeft: "auto",
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    docSugBookText: {
      fontSize: 11,
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
    },
    quickPrompts: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    quickPromptChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.muted,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickPromptText: {
      fontSize: 12,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: Math.max(botPad, 12),
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
      paddingVertical: 9,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      maxHeight: 100,
    },
    sendBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.mutedForeground,
      marginHorizontal: 2,
    },
    typingRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
    },
    disclaimerText: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      paddingBottom: 4,
    },
  });

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === "user";
      const isEmpty = item.content === "" && !isUser;

      return (
        <View style={[s.msgRow, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
          {!isUser && (
            <View style={s.botIcon}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
          )}
          <View style={{ maxWidth: "82%" }}>
            <View style={[s.bubble, isUser ? s.userBubble : s.botBubble]}>
              {isEmpty ? (
                <View style={s.typingRow}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={s.typingDot} />
                  ))}
                </View>
              ) : (
                <Text style={[s.bubbleText, { color: isUser ? "#fff" : colors.foreground }]}>
                  {item.content}
                  {!isUser && streaming && item === messages[0] ? (
                    <Text style={s.cursor}>▌</Text>
                  ) : null}
                </Text>
              )}
            </View>

            {/* Suggested doctors */}
            {!isUser && item.suggestedDoctors && item.suggestedDoctors.length > 0 && (
              <View style={s.doctorSuggestions}>
                <Text style={s.docSugLabel}>Suggested doctors for you:</Text>
                {item.suggestedDoctors.slice(0, 3).map((docId) => {
                  const doc = DOCTORS.find((d) => d.id === docId);
                  if (!doc) return null;
                  return (
                    <Pressable
                      key={doc.id}
                      style={s.docSugCard}
                      onPress={() => router.push(`/doctor/${doc.id}`)}
                    >
                      <Image
                        source={{ uri: doc.avatar }}
                        style={s.docSugAvatar}
                        contentFit="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.docSugName} numberOfLines={1}>{doc.name}</Text>
                        <Text style={s.docSugSpec}>{doc.specialization}</Text>
                        <Text style={s.docSugFee}>₹{doc.fee} • ⭐ {doc.rating}</Text>
                      </View>
                      <View style={s.docSugBookBtn}>
                        <Text style={s.docSugBookText}>Book</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      );
    },
    [colors, messages, streaming, router]
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color={colors.foreground} />
        </Pressable>
        <View style={s.botAvatarBg}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
        </View>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>AI Health Assistant</Text>
          <Text style={s.headerSub}>{streaming ? "Thinking..." : "Online · MediConnect AI"}</Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={() => {
            setMessages([WELCOME]);
            setInput("");
          }}
        >
          <Ionicons name="refresh" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListFooterComponent={() => (
            <Text style={s.disclaimerText}>
              AI responses are informational only. Always consult a doctor.
            </Text>
          )}
        />

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <View style={s.quickPrompts}>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={(p) => p}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={s.quickPromptChip}
                  onPress={() => sendMessage(item)}
                >
                  <Text style={s.quickPromptText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Input row */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe your symptoms or ask anything..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            style={[
              s.sendBtn,
              {
                backgroundColor:
                  input.trim() && !streaming ? colors.primary : colors.muted,
              },
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
          >
            {streaming ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name="send"
                size={16}
                color={input.trim() ? "#fff" : colors.mutedForeground}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
