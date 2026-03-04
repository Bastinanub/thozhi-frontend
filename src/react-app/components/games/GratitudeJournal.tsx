import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";

interface GratitudeEntry {
  text: string;
  timestamp: string;
}

export default function GratitudeJournal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;

    const newEntry: GratitudeEntry = {
      text,
      timestamp: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setInput("");
  };

  const handleDelete = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-white fill-current" />
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Gratitude Journal
        </h2>
        <p className="text-gray-600">What are you grateful for today?</p>
      </div>

      {/* Input Area */}
      <div className="mb-8">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="I'm grateful for..."
          rows={3}
          className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-300 resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="mt-4 w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Add Entry
        </button>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl text-center">
          <div className="text-3xl font-bold text-green-700 mb-1">
            {entries.length}
          </div>
          <div className="text-sm text-green-600">
            {entries.length === 1 ? "thing" : "things"} to be grateful for
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Gratitudes</h3>
          {entries.map((entry, index) => (
            <div
              key={index}
              className="group bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 animate-slide-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed mb-2">{entry.text}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()} at{" "}
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">📝</div>
          <p className="text-gray-500">No entries yet. Start by adding something you're grateful for!</p>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
