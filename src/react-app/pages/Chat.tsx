import { useState, useEffect, useRef } from "react";
import { Send, Download, Loader2 } from "lucide-react";

const API_BASE_URL = "https://thozhi-backend.onrender.com";

/* -----------------------------
   Types
----------------------------- */

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

/* -----------------------------
   Chat Component
----------------------------- */

export default function ChatPage() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastReport, setLastReport] = useState<Report | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Persist session id */

  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("thozhi_session");
    if (existing) return existing;

    const id = `session_${Date.now()}`;
    localStorage.setItem("thozhi_session", id);
    return id;
  });

  /* Auto scroll */

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  /* -----------------------------
     Send Message
  ----------------------------- */

  const sendMessage = async () => {

    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");

    setMessages(prev => [
      ...prev,
      { text, sender: "user" }
    ]);

    setIsLoading(true);

    /* Add empty bot bubble */

    setMessages(prev => [
      ...prev,
      { text: "", sender: "bot", streaming: true }
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {

      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          history: messages
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {

        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {

          const line = part.trim();

          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace("data:", "").trim();

          let parsed;

          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          const { token, done: streamDone, report } = parsed;

          if (token) {

            setMessages(prev => {

              const updated = [...prev];
              const last = updated[updated.length - 1];

              if (last?.sender === "bot") {
                updated[updated.length - 1] = {
                  ...last,
                  text: last.text + token
                };
              }

              return updated;
            });
          }

          if (streamDone) {

            setMessages(prev => {

              const updated = [...prev];
              const last = updated[updated.length - 1];

              if (last?.sender === "bot") {
                updated[updated.length - 1] = {
                  ...last,
                  streaming: false
                };
              }

              return updated;
            });

            if (report) setLastReport(report);

            break;
          }
        }
      }

    } catch (err) {

      console.error(err);

      setMessages(prev => {

        const updated = [...prev];
        const last = updated[updated.length - 1];

        if (last?.sender === "bot") {
          updated[updated.length - 1] = {
            text: "I'm having trouble connecting right now. Please try again.",
            sender: "bot",
            streaming: false
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
     Download Report
  ----------------------------- */

  const downloadPDF = async () => {

    if (!lastReport) return;

    try {

      const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(lastReport)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "thozhi_report.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
    }
  };

  /* -----------------------------
     Enter key
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

          <h1 className="text-2xl font-bold text-white">
            Chat with Thozhi
          </h1>

          <p className="text-indigo-100 text-sm">
            Your compassionate AI wellness companion
          </p>

        </div>

        {/* Chat */}

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
              className={`flex ${msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
                }`}
            >

              <div
                className={`max-w-[75%] px-5 py-3 rounded-2xl ${msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-white shadow text-gray-800"
                  }`}
              >

                <p className="text-sm whitespace-pre-wrap">

                  {msg.text}

                  {msg.streaming && (
                    <span className="inline-block w-[2px] h-4 bg-indigo-400 ml-1 animate-pulse" />
                  )}

                </p>

              </div>

            </div>

          ))}

          {isLoading && messages[messages.length - 1]?.text === "" && (

            <div className="flex justify-start">

              <div className="bg-white shadow px-4 py-2 rounded-full flex items-center gap-2">

                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />

                <span className="text-sm text-gray-600">
                  Thozhi is typing…
                </span>

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