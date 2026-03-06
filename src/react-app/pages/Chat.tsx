import { useState, useEffect, useRef } from "react";
import { Send, Download, Loader2 } from "lucide-react";

const API_BASE_URL = "https://thozhi-backend.onrender.com";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Message {
  text: string;
  sender: "user" | "bot";
  streaming?: boolean;
}

interface Report {
  domain: string;
  tool_used: string;
  score: number;
  interpretation: string;
  summary: string;
  recommendation: string;
  disclaimer: string;
  generated_at: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [lastReport, setLastReport] = useState<Report | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // Persist session ID across page refreshes
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("thozhi_session");
    if (existing) return existing;
    const id = `session_${Date.now()}`;
    localStorage.setItem("thozhi_session", id);
    return id;
  });

  // Auto-scroll on new messages
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  // ─────────────────────────────────────────────
  // Build history in the format the backend expects:
  // [{ user: string, bot: string }]
  // ─────────────────────────────────────────────
  const buildHistory = (msgs: Message[]) =>
    msgs.reduce<{ user: string; bot: string }[]>((acc, msg, i, arr) => {
      if (msg.sender === "user") {
        const next = arr[i + 1];
        acc.push({
          user: msg.text,
          bot: next?.sender === "bot" ? next.text : "",
        });
      }
      return acc;
    }, []);

  // ─────────────────────────────────────────────
  // Replace the streaming bot bubble with final text
  // ─────────────────────────────────────────────
  const finaliseLastBotBubble = (text: string) => {
    setMessages(prev => {
      const updated = [...prev];
      const last    = updated[updated.length - 1];
      if (last?.sender === "bot") {
        updated[updated.length - 1] = { text, sender: "bot", streaming: false };
      }
      return updated;
    });
  };

  // ─────────────────────────────────────────────
  // Send message — SSE stream, falls back to /chat
  // ─────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    // Snapshot history BEFORE adding the new user message
    const history = buildHistory(messages);

    setMessages(prev => [
      ...prev,
      { text, sender: "user" },
      { text: "", sender: "bot", streaming: true },   // placeholder bot bubble
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    const body = JSON.stringify({ session_id: sessionId, message: text, history });

    try {
      // ── Try SSE stream first ──────────────────────────────────────────────
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body,
      });

      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      outer: while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data:")) continue;

          let parsed: { token: string; done: boolean; next_action: string | null; report: Report | null };
          try {
            parsed = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }

          const { token, done: streamDone, report } = parsed;

          if (token) {
            setMessages(prev => {
              const updated = [...prev];
              const last    = updated[updated.length - 1];
              if (last?.sender === "bot") {
                updated[updated.length - 1] = { ...last, text: last.text + token };
              }
              return updated;
            });
          }

          if (streamDone) {
            setMessages(prev => {
              const updated = [...prev];
              const last    = updated[updated.length - 1];
              if (last?.sender === "bot") {
                updated[updated.length - 1] = { ...last, streaming: false };
              }
              return updated;
            });
            if (report) setLastReport(report);
            break outer;
          }
        }
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;

      // ── Fallback: blocking /chat ──────────────────────────────────────────
      console.warn("Stream failed, falling back to /chat:", err);
      try {
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        finaliseLastBotBubble(data.reply || "I'm here to listen.");
        if (data.report) setLastReport(data.report);
      } catch (fallbackErr) {
        console.error("Fallback failed:", fallbackErr);
        finaliseLastBotBubble("Connection issue. Please try again.");
      }

    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  // ─────────────────────────────────────────────
  // PDF download
  // ─────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!lastReport) return;
    try {
      const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastReport),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "thozhi_report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Chat with Thozhi</h1>
          <p className="text-indigo-100 text-sm">Your compassionate AI wellness companion</p>
        </div>

        {/* Chat box */}
        <div
          ref={chatBoxRef}
          className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-purple-50/30"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Start a conversation whenever you feel ready 🌸
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-white shadow text-gray-800"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                  {msg.streaming && (
                    <span className="inline-block w-[2px] h-3.5 bg-indigo-400 ml-0.5 align-middle animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Spinner only shown before the first token arrives */}
          {isLoading && messages[messages.length - 1]?.text === "" && (
            <div className="flex justify-start">
              <div className="bg-white shadow px-4 py-2 rounded-full flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-600">Thozhi is typing…</span>
              </div>
            </div>
          )}

          {lastReport && (
            <div className="flex justify-center mt-6">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t bg-white/70">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 rounded-full border focus:ring-2 focus:ring-indigo-300 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow hover:scale-105 transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}