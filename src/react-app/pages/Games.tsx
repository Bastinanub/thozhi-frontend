import { useState } from "react";
import { Brain, Heart, Focus, Smile } from "lucide-react";
import BreathingExercise from "@/react-app/components/games/BreathingExercise";
import MemoryGame from "@/react-app/components/games/MemoryGame";
import MoodTracker from "@/react-app/components/games/MoodTracker";
import GratitudeJournal from "@/react-app/components/games/GratitudeJournal";

type GameType = "breathing" | "memory" | "mood" | "gratitude" | null;

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const games = [
    {
      id: "breathing" as GameType,
      title: "Breathing Exercise",
      description: "Calm your mind with guided breathing",
      icon: Heart,
      color: "from-blue-500 to-cyan-500",
      component: BreathingExercise,
    },
    {
      id: "memory" as GameType,
      title: "Memory Match",
      description: "Boost focus with pattern matching",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      component: MemoryGame,
    },
    {
      id: "mood" as GameType,
      title: "Mood Tracker",
      description: "Track and reflect on your emotions",
      icon: Smile,
      color: "from-yellow-500 to-orange-500",
      component: MoodTracker,
    },
    {
      id: "gratitude" as GameType,
      title: "Gratitude Journal",
      description: "Express what you're grateful for",
      icon: Focus,
      color: "from-green-500 to-emerald-500",
      component: GratitudeJournal,
    },
  ];

  const ActiveGameComponent = games.find((g) => g.id === activeGame)?.component;

  if (activeGame && ActiveGameComponent) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setActiveGame(null)}
          className="mb-6 px-6 py-2.5 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full font-medium hover:bg-white transition-all duration-300 hover:shadow-lg"
        >
          ← Back to Games
        </button>
        <ActiveGameComponent />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Mental Wellness Games
        </h1>
        <p className="text-gray-600 text-lg">
          Choose an activity to improve your mental well-being
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {games.map((game, index) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className="group relative animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${game.color} rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300`}></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <game.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{game.title}</h3>
              <p className="text-gray-600">{game.description}</p>
              <div className="mt-6 flex items-center text-indigo-600 font-medium">
                <span>Start Activity</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
