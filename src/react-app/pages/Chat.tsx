import { useState, useEffect, useRef } from "react";
import { Send, Download, Loader2 } from "lucide-react";

const API_BASE_URL = "https://thozhi-backend.render.com"

/* -----------------------------
   Types
----------------------------- */
interface Message {
  text: string;
  sender: "user" | "bot";
  streaming?: boolean; // true while the bot message is still being written
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

/* -----------------------------
   Chat Component
----------------------------- */
export default function ChatPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [sessionId]                 = useState(() => `session_${Date.now()}`);
  const [lastReport, setLastReport] = useState<Report | null>(null);

  const chatBoxRef  = useRef<HTMLDivElement>(null);
  // Keeps a live ref to the abort controller so we can cancel mid-stream
  const abortRef    = useRef<AbortController | null>(null);

  /* Auto-scroll whenever messages update */
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /* Cleanup on unmount */
  useEffect(() => () => abortRef.current?.abort(), []);

  /* -----------------------------
     Send Message — SSE streaming
  ----------------------------- */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Add user bubble
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setInput("");
    setIsLoading(true);

    // Add an empty bot bubble that we'll fill in token by token
    setMessages((prev) => [...prev, { text: "", sender: "bot", streaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          history: messages.map((m) => ({
            user: m.sender === "user" ? m.text : "",
            bot:  m.sender === "bot"  ? m.text : "",
          })),
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? ""; // last chunk may be incomplete

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

          // Append token to the last (streaming) bot message
          if (token) {
            setMessages((prev) => {
              const updated = [...prev];
              const last    = updated[updated.length - 1];
              if (last?.sender === "bot") {
                updated[updated.length - 1] = { ...last, text: last.text + token };
              }
              return updated;
            });
          }

          if (streamDone) {
            // Mark streaming as complete so the cursor blink stops
            setMessages((prev) => {
              const updated = [...prev];
              const last    = updated[updated.length - 1];
              if (last?.sender === "bot") {
                updated[updated.length - 1] = { ...last, streaming: false };
              }
              return updated;
            });

            if (report) setLastReport(report);
            break;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // user cancelled

      console.error("Stream error:", err);

      // Replace the empty streaming bubble with an error message
      setMessages((prev) => {
        const updated = [...prev];
        const last    = updated[updated.length - 1];
        if (last?.sender === "bot") {
          updated[updated.length - 1] = {
            text: "I'm having trouble connecting right now. Please try again.",
            sender: "bot",
            streaming: false,
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  /* -----------------------------
     Download PDF Report
  ----------------------------- */
  const downloadPDF = async () => {
    if (!lastReport) return;
    try {
      const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastReport),
      });
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

  /* -----------------------------
     Enter key handler
  ----------------------------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Chat with Thozhi</h1>
          <p className="text-indigo-100 text-sm">Your compassionate AI wellness companion</p>
        </div>

        {/* Chat Box */}
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
                  {/* Blinking cursor while streaming */}
                  {msg.streaming && (
                    <span className="inline-block w-[2px] h-4 bg-indigo-400 ml-0.5 align-middle animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Show spinner only before the first token arrives */}
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
              onChange={(e) => setInput(e.target.value)}
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
