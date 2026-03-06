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
  const inputRef   = useRef<HTMLInputElement>(null); // ← NEW: ref for focusing
  const abortRef   = useRef<AbortController | null>(null);

  // Persist session ID
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("thozhi_session");
    if (existing) return existing;
    const id = `session_${Date.now()}`;
    localStorage.setItem("thozhi_session", id);
    return id;
  });

  // Auto-scroll
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Focus input after stream finishes or fallback reply is set
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, messages.length]); // re-focus when loading ends or new message appears

  // Cleanup
  useEffect(() => () => abortRef.current?.abort(), []);

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

  const finaliseLastBotBubble = (text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.sender === "bot") {
        updated[updated.length - 1] = { text, sender: "bot", streaming: false };
      }
      return updated;
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    const history = buildHistory(messages);

    setMessages((prev) => [
      ...prev,
      { text, sender: "user" },
      { text: "", sender: "bot", streaming: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    const body = JSON.stringify({ session_id: sessionId, message: text, history });

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body,
      });

      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last?.sender === "bot") {
                updated[updated.length - 1] = { ...last, text: last.text + token };
              }
              return updated;
            });
          }

          if (streamDone) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
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

      console.warn("Stream failed, falling back to /chat:", err);
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
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
      // Focus will be handled by the useEffect watching isLoading
    }
  };

  const downloadPDF = async () => {
    if (!lastReport) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastReport),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-3 sm:px-4 md:px-6">

        {/* Header - smaller on mobile */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 sm:px-8 py-5 sm:py-6 rounded-t-3xl mt-3 sm:mt-6 shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Chat with Thozhi</h1>
          <p className="text-indigo-100 text-xs sm:text-sm">Your compassionate AI wellness companion</p>
        </div>

        {/* Chat messages */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-inner border border-white/30 min-h-[50vh]"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 text-center px-4 py-10">
              Start a conversation whenever you feel ready 🌸
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-white shadow-md text-gray-800"
                }`}
              >
                {msg.text}
                {msg.streaming && (
                  <span className="inline-block w-1 h-4 bg-indigo-300 ml-1 align-middle animate-pulse" />
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.text === "" && (
            <div className="flex justify-start">
              <div className="bg-white shadow px-4 py-2.5 rounded-full flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-600">Thozhi is typing…</span>
              </div>
            </div>
          )}

          {lastReport && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          )}
        </div>

        {/* Input area - mobile optimized */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 md:p-6 z-10">
          <div className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full border border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/50 outline-none text-sm sm:text-base transition shadow-sm"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow hover:scale-105 transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center min-w-[52px]"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}