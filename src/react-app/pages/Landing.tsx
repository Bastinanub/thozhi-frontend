import { useNavigate } from "react-router";
import { Sparkles, MessageCircle, Brain, BookOpen } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Thozhi
              </span>
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="px-6 py-2.5 bg-white/80 backdrop-blur-sm text-indigo-600 rounded-full font-medium hover:bg-white transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 animate-fade-in">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Your Companion for
                <br />
                Mental Wellness
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                A safe space to talk, play mindful games, and discover daily insights
                for a healthier, happier mind.
              </p>
              <button
                onClick={() => navigate("/chat")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
              >
                Get Started Free
              </button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FeatureCard
                icon={<MessageCircle className="w-10 h-10" />}
                title="AI Chat Support"
                description="Talk to Thozhi anytime. Get personalized responses and download conversation reports."
                gradient="from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={<Brain className="w-10 h-10" />}
                title="Mindful Games"
                description="Play engaging games designed to reduce stress, improve focus, and boost your mood."
                gradient="from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={<BookOpen className="w-10 h-10" />}
                title="Daily Readings"
                description="Explore curated mental health articles and insights to inspire your wellness journey."
                gradient="from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8 text-center text-gray-500">
          <p>© 2024 Thozhi. Your mental wellness companion.</p>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

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

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
