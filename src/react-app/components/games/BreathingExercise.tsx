import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        if (phase === "inhale") {
          setPhase("hold");
          return 4;
        } else if (phase === "hold") {
          setPhase("exhale");
          return 4;
        } else {
          setPhase("inhale");
          setCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const reset = () => {
    setIsActive(false);
    setPhase("inhale");
    setCount(4);
    setCycles(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-500 to-cyan-500";
      case "hold":
        return "from-purple-500 to-pink-500";
      case "exhale":
        return "from-green-500 to-emerald-500";
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/20">
      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        4-4-4 Breathing Exercise
      </h2>
      <p className="text-gray-600 mb-12">
        Follow the circle to calm your mind and reduce stress
      </p>

      <div className="relative w-80 h-80 mx-auto mb-12">
        {/* Breathing circle */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getPhaseColor()} transition-all duration-1000 ${
            isActive && phase === "inhale" ? "scale-100" : phase === "hold" ? "scale-100" : "scale-75"
          }`}
          style={{
            boxShadow: "0 20px 60px rgba(99, 102, 241, 0.3)",
            opacity: 0.9,
          }}
        ></div>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="text-6xl font-bold mb-2">{count}</div>
          <div className="text-2xl font-medium">{getPhaseText()}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="text-sm text-gray-600 mb-2">Cycles completed</div>
        <div className="text-3xl font-bold text-indigo-600">{cycles}</div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? "Pause" : "Start"}
        </button>

        <button
          onClick={reset}
          className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </div>
  );
}
