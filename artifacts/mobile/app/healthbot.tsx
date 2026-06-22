import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import React, { useCallback, useRef, useState } from "react";
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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Doctor {
  id: number; name: string; specialization: string; avatar: string;
  rating: number; fee: number; city: string; experience: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isPrescription?: boolean;
  suggestedDoctors?: Doctor[];
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your Medofile AI Health Assistant. I can help you with:\n\n• Health questions and possible causes of symptoms\n• Finding the right specialist\n• General wellness advice\n• Prescription photo analysis\n\n⚠️ I suggest possibilities — only a doctor can diagnose. How can I help?",
};

const QUICK_PROMPTS = [
  "I have chest pain and shortness of breath",
  "My child has fever since 2 days",
  "I need a skin specialist in Mumbai",
  "What are symptoms of diabetes?",
  "Back pain after long sitting",
  "I feel anxious and stressed",
];

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

function parseDoctorTag(text: string): { clean: string; spec: string[]; city: string } | null {
  const match = text.match(/<doctors>([\s\S]*?)<\/doctors>/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    return {
      clean: text.replace(/<doctors>[\s\S]*?<\/doctors>/, "").trim(),
      spec: data.specializations || [],
      city: data.city || "",
    };
  } catch { return null; }
}

async function fetchDoctorSuggestions(specializations: string[], city: string): Promise<Doctor[]> {
  try {
    const params = new URLSearchParams();
    if (specializations.length) params.set("specializations", specializations.join(","));
    if (city) params.set("city", city);
    const r = await fetch(`${API_BASE}/doctors/suggestions?${params}`);
    if (!r.ok) return [];
    return await r.json() as Doctor[];
  } catch { return []; }
}

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
    async (text: string, imageBase64?: string) => {
      const trimmed = text.trim();
      if (!trimmed && !imageBase64) return;
      if (streaming) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInput("");

      const displayContent = imageBase64 ? `📷 Prescription photo sent` : trimmed;
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: displayContent,
        isPrescription: !!imageBase64,
      };

      const assistantId = (Date.now() + 1).toString();
      const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

      setMessages((prev) => [assistantMsg, userMsg, ...prev]);
      setStreaming(true);
      abortRef.current = false;

      try {
        let endpoint = `${API_BASE}/chat`;
        let body: object;

        if (imageBase64) {
          endpoint = `${API_BASE}/chat/prescription`;
          body = { imageBase64 };
        } else {
          const history = messages.map((m) => ({ role: m.role, content: m.content }));
          history.push({ role: "user", content: trimmed });
          body = { messages: history };
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                accumulated += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch {}
          }
        }

        const parsed = parseDoctorTag(accumulated);
        if (parsed && !imageBase64) {
          const docs = await fetchDoctorSuggestions(parsed.spec, parsed.city);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: parsed.clean, suggestedDoctors: docs }
                : m
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "I'm having trouble connecting right now. Please check your connection and try again." }
              : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  async function handlePrescriptionPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mime};base64,${asset.base64}`;
    await sendMessage("Analyze this prescription", dataUrl);
  }

  async function handleCameraPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const dataUrl = `data:image/jpeg;base64,${asset.base64}`;
    await sendMessage("Analyze this prescription", dataUrl);
  }

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
    headerTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    headerSub: { fontSize: 11, color: colors.accent, fontFamily: "Inter_400Regular" },
    listContent: { padding: 14, paddingBottom: 8, flexGrow: 1 },
    msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10, gap: 8 },
    botIcon: {
      width: 28, height: 28, borderRadius: 9,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center", marginBottom: 2,
    },
    bubble: { maxWidth: "80%", padding: 12, borderRadius: 16 },
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    botBubble: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    prescriptionBubble: {
      backgroundColor: "#FFF3E0",
      borderBottomRightRadius: 4,
      borderWidth: 1,
      borderColor: "#FFB74D",
    },
    bubbleText: { fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular" },
    cursor: { fontSize: 14, color: colors.primary, fontFamily: "Inter_700Bold" },
    doctorSuggestions: { marginTop: 10, gap: 6 },
    docSugLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 2 },
    docSugCard: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.secondary,
      borderRadius: 10, padding: 8,
      borderWidth: 1, borderColor: colors.border,
    },
    docSugAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted },
    docSugName: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    docSugSpec: { fontSize: 10, color: colors.primary, fontFamily: "Inter_400Regular" },
    docSugFee: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    docSugBookBtn: {
      marginLeft: "auto" as any,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 5,
    },
    docSugBookText: { fontSize: 11, color: "#fff", fontFamily: "Inter_600SemiBold" },
    quickPrompts: {
      paddingHorizontal: 14, paddingVertical: 8,
      backgroundColor: colors.card,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    quickPromptChip: {
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 20, backgroundColor: colors.muted,
      marginRight: 8, borderWidth: 1, borderColor: colors.border,
    },
    quickPromptText: { fontSize: 12, color: colors.foreground, fontFamily: "Inter_400Regular" },
    inputRow: {
      flexDirection: "row", alignItems: "flex-end",
      paddingHorizontal: 14, paddingTop: 8,
      paddingBottom: Math.max(botPad, 12),
      backgroundColor: colors.card,
      borderTopWidth: 1, borderTopColor: colors.border,
      gap: 6,
    },
    mediaBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.muted,
      alignItems: "center", justifyContent: "center",
    },
    input: {
      flex: 1, backgroundColor: colors.muted,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
      fontSize: 14, color: colors.foreground,
      fontFamily: "Inter_400Regular", maxHeight: 100,
    },
    sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mutedForeground, marginHorizontal: 2 },
    typingRow: { flexDirection: "row", alignItems: "center", padding: 10 },
    disclaimerText: {
      fontSize: 10, color: colors.mutedForeground,
      fontFamily: "Inter_400Regular", textAlign: "center", paddingBottom: 4,
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
            <View style={[s.bubble, isUser ? (item.isPrescription ? s.prescriptionBubble : s.userBubble) : s.botBubble]}>
              {isEmpty ? (
                <View style={s.typingRow}>
                  {[0, 1, 2].map((i) => <View key={i} style={s.typingDot} />)}
                </View>
              ) : (
                <Text style={[s.bubbleText, { color: isUser ? (item.isPrescription ? "#E65100" : "#fff") : colors.foreground }]}>
                  {item.content}
                  {!isUser && streaming && item === messages[0] ? <Text style={s.cursor}>▌</Text> : null}
                </Text>
              )}
            </View>

            {!isUser && item.suggestedDoctors && item.suggestedDoctors.length > 0 && (
              <View style={s.doctorSuggestions}>
                <Text style={s.docSugLabel}>Recommended specialists on Medofile:</Text>
                {item.suggestedDoctors.map((doc) => (
                  <Pressable
                    key={doc.id}
                    style={s.docSugCard}
                    onPress={() => router.push(`/doctor/${doc.id}`)}
                  >
                    <Image source={{ uri: doc.avatar }} style={s.docSugAvatar} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.docSugName} numberOfLines={1}>{doc.name}</Text>
                      <Text style={s.docSugSpec}>{doc.specialization} · {doc.city}</Text>
                      <Text style={s.docSugFee}>₹{doc.fee} · ⭐ {doc.rating} · {doc.experience}y exp</Text>
                    </View>
                    <View style={s.docSugBookBtn}>
                      <Text style={s.docSugBookText}>Book</Text>
                    </View>
                  </Pressable>
                ))}
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
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color={colors.foreground} />
        </Pressable>
        <View style={s.botAvatarBg}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
        </View>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>AI Health Assistant</Text>
          <Text style={s.headerSub}>{streaming ? "Thinking..." : "Online · Medofile AI"}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => { setMessages([WELCOME]); setInput(""); }}>
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
              AI suggests possibilities only — not diagnoses. Always consult a qualified doctor.
            </Text>
          )}
        />

        {messages.length <= 1 && (
          <View style={s.quickPrompts}>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={(p) => p}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable style={s.quickPromptChip} onPress={() => sendMessage(item)}>
                  <Text style={s.quickPromptText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        <View style={s.inputRow}>
          <Pressable style={s.mediaBtn} onPress={handlePrescriptionPhoto} hitSlop={4}>
            <Ionicons name="document-text-outline" size={18} color={colors.mutedForeground} />
          </Pressable>
          <Pressable style={s.mediaBtn} onPress={handleCameraPhoto} hitSlop={4}>
            <Ionicons name="camera-outline" size={18} color={colors.mutedForeground} />
          </Pressable>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe symptoms or ask anything..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            style={[s.sendBtn, { backgroundColor: input.trim() && !streaming ? colors.primary : colors.muted }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
          >
            {streaming
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="send" size={16} color={input.trim() ? "#fff" : colors.mutedForeground} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
