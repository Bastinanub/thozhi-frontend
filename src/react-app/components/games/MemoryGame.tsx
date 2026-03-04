import { useState, useEffect } from "react";
import { RotateCcw, Star } from "lucide-react";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ["🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "🏵️", "💐"];

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches((m) => m + 1);
          setFlippedCards([]);

          // Check if won
          if (matches + 1 === emojis.length) {
            setIsWon(true);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves((m) => m + 1);
    }
  }, [flippedCards, cards, matches]);

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, id]);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Memory Match
        </h2>
        <p className="text-gray-600">Match all the pairs to win!</p>
      </div>

      <div className="flex justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Moves</div>
          <div className="text-2xl font-bold text-indigo-600">{moves}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Matches</div>
          <div className="text-2xl font-bold text-purple-600">
            {matches}/{emojis.length}
          </div>
        </div>
      </div>

      {isWon && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl text-center animate-bounce-once">
          <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-xl mb-2">
            <Star className="w-6 h-6 fill-current" />
            Congratulations!
            <Star className="w-6 h-6 fill-current" />
          </div>
          <p className="text-green-600">
            You completed the game in {moves} moves!
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-8">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 transform ${
              card.isFlipped || card.isMatched
                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105"
                : "bg-gradient-to-br from-gray-200 to-gray-300 hover:scale-105 hover:shadow-lg"
            } ${card.isMatched ? "opacity-60" : ""}`}
            disabled={card.isMatched}
          >
            {card.isFlipped || card.isMatched ? card.emoji : "?"}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={initializeGame}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          New Game
        </button>
      </div>

      <style>{`
        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
