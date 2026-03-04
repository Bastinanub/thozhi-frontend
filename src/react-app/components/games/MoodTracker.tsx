import { useState } from "react";
import { Smile, Frown, Meh, Laugh, Angry } from "lucide-react";

interface MoodEntry {
  mood: string;
  note: string;
  timestamp: string;
}

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  const moods = [
    { name: "Great", icon: Laugh, color: "from-green-500 to-emerald-500", emoji: "😄" },
    { name: "Good", icon: Smile, color: "from-blue-500 to-cyan-500", emoji: "😊" },
    { name: "Okay", icon: Meh, color: "from-yellow-500 to-orange-500", emoji: "😐" },
    { name: "Bad", icon: Frown, color: "from-orange-500 to-red-500", emoji: "😔" },
    { name: "Terrible", icon: Angry, color: "from-red-500 to-pink-500", emoji: "😢" },
  ];

  const handleSubmit = () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      mood: selectedMood,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setSelectedMood(null);
    setNote("");
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Mood Tracker
        </h2>
        <p className="text-gray-600">How are you feeling today?</p>
      </div>

      {/* Mood Selection */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => setSelectedMood(mood.name)}
            className={`group relative transition-all duration-300 ${
              selectedMood === mood.name ? "scale-110" : "hover:scale-105"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${mood.color} rounded-2xl blur ${
                selectedMood === mood.name ? "opacity-50" : "opacity-0 group-hover:opacity-30"
              } transition duration-300`}
            ></div>
            <div
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center ${
                selectedMood === mood.name
                  ? `bg-gradient-to-br ${mood.color} text-white shadow-xl`
                  : "bg-white text-gray-700 shadow-md"
              }`}
            >
              <div className="text-4xl mb-2">{mood.emoji}</div>
              <div className="text-xs font-medium">{mood.name}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Note Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-300 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedMood}
        className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Log Mood
      </button>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Entries</h3>
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry, index) => {
              const mood = moods.find((m) => m.name === entry.mood);
              return (
                <div
                  key={index}
                  className="bg-white p-4 rounded-2xl shadow-md border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{mood?.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{entry.mood}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-gray-600 pl-11">{entry.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
