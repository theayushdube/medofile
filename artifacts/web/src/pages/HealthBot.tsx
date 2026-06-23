import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Sparkles, Send, RefreshCw, Camera, FileText, ArrowLeft, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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
  content: "Hello! I'm your Medofile AI Health Assistant. I can help you with:\n\n• Health questions and possible causes of symptoms\n• Finding the right specialist\n• General wellness advice\n• Prescription photo analysis\n\n⚠️ I suggest possibilities — only a doctor can diagnose. How can I help?",
};

const QUICK_PROMPTS = [
  "I have chest pain and shortness of breath",
  "My child has fever since 2 days",
  "I need a skin specialist in Mumbai",
  "What are symptoms of diabetes?",
  "Back pain after long sitting",
  "I feel anxious and stressed",
];

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
    const r = await fetch(`/api/doctors/suggestions?${params}`);
    if (!r.ok) return [];
    return await r.json() as Doctor[];
  } catch { return []; }
}

function formatContent(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split("\n").length - 1 && <br />}
    </span>
  ));
}

export default function HealthBot() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string, imageDataUrl?: string) => {
    const trimmed = text.trim();
    if (!trimmed && !imageDataUrl) return;
    if (streaming) return;

    setInput("");

    const displayContent = imageDataUrl ? "📷 Prescription photo sent for analysis" : trimmed;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayContent,
      isPrescription: !!imageDataUrl,
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);
    abortRef.current = false;

    try {
      let endpoint = "/api/chat";
      let body: object;

      if (imageDataUrl) {
        endpoint = "/api/chat/prescription";
        body = { imageBase64: imageDataUrl };
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
        if (abortRef.current) { reader.cancel(); break; }
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
                prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
              );
            }
          } catch {}
        }
      }

      const parsed = parseDoctorTag(accumulated);
      if (parsed && !imageDataUrl) {
        const docs = await fetchDoctorSuggestions(parsed.spec, parsed.city);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: parsed.clean, suggestedDoctors: docs } : m
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
  }, [messages, streaming]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      sendMessage("Analyze this prescription", reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col px-4 pb-4">
        {/* Chat header */}
        <div className="flex items-center gap-3 py-4 border-b border-border mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-foreground text-sm">AI Health Assistant</div>
            <div className="text-xs text-emerald-500 font-medium">
              {streaming ? "Thinking..." : "Online · Powered by Medofile AI"}
            </div>
          </div>
          <button
            onClick={() => { setMessages([WELCOME]); setInput(""); }}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Clear conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 min-h-0" style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
          <p className="text-xs text-center text-muted-foreground py-1">
            AI suggests possibilities only — not diagnoses. Always consult a qualified doctor.
          </p>

          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isEmpty = msg.content === "" && !isUser;

            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? msg.isPrescription
                          ? "bg-orange-50 border border-orange-200 text-orange-800 rounded-br-sm"
                          : "bg-primary text-white rounded-br-sm"
                        : "bg-card border border-border text-foreground rounded-bl-sm"
                    }`}
                  >
                    {isEmpty ? (
                      <span className="flex gap-1 items-center py-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    ) : (
                      <span>
                        {formatContent(msg.content)}
                        {!isUser && streaming && msg === messages[messages.length - 1] && (
                          <span className="text-primary font-bold animate-pulse">▌</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Doctor suggestion cards */}
                  {!isUser && msg.suggestedDoctors && msg.suggestedDoctors.length > 0 && (
                    <div className="w-full space-y-2">
                      <p className="text-xs text-muted-foreground font-medium px-1">Recommended specialists on Medofile:</p>
                      {msg.suggestedDoctors.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => navigate(`/doctors/${doc.id}`)}
                          className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                        >
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className="w-10 h-10 rounded-full object-cover bg-muted flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate">{doc.name}</div>
                            <div className="text-xs text-primary">{doc.specialization} · {doc.city}</div>
                            <div className="text-xs text-muted-foreground">₹{doc.fee} · ⭐ {doc.rating} · {doc.experience}y exp</div>
                          </div>
                          <div className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0">
                            Book
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts (only when fresh) */}
        {messages.length <= 1 && (
          <div className="py-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted border border-border hover:border-primary hover:text-primary transition-colors text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-border pt-3">
          <div className="flex items-end gap-2">
            {/* Prescription upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={streaming}
              className="w-10 h-10 rounded-xl bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
              title="Upload prescription"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
            </button>

            <textarea
              className="flex-1 resize-none bg-muted rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[42px] max-h-[120px]"
              placeholder="Describe symptoms or ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={streaming}
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Press Enter to send · Shift+Enter for new line · Upload prescription with 📄
          </p>
        </div>
      </div>
    </div>
  );
}
