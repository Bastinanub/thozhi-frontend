import { Calendar, Clock, BookOpen, ExternalLink } from "lucide-react";

interface Reading {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
  url: string;
}

export default function ReadingsPage() {
  const readings: Reading[] = [
    {
      id: 1,
      title: "The Science of Gratitude: How It Changes Your Brain",
      excerpt: "Research shows that practicing gratitude can rewire your brain for more happiness and resilience. Learn about the neuroscience behind this powerful practice.",
      category: "Neuroscience",
      readTime: 5,
      date: "2024-01-15",
      url: "https://greatergood.berkeley.edu/article/item/how_gratitude_changes_you_and_your_brain",
    },
    {
      id: 2,
      title: "Mindfulness Meditation: A Beginner's Guide",
      excerpt: "Discover how mindfulness meditation can reduce stress, improve focus, and enhance overall well-being. Simple techniques to get started today.",
      category: "Meditation",
      readTime: 7,
      date: "2024-01-14",
      url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
    },
    {
      id: 3,
      title: "Understanding Anxiety: What Your Body Is Trying to Tell You",
      excerpt: "Anxiety isn't just mental—it's a full-body experience. Learn to recognize the signs and develop healthy coping mechanisms.",
      category: "Mental Health",
      readTime: 6,
      date: "2024-01-13",
      url: "https://www.psychiatry.org/patients-families/anxiety-disorders/what-are-anxiety-disorders",
    },
    {
      id: 4,
      title: "The Power of Sleep for Mental Health",
      excerpt: "Quality sleep is essential for emotional regulation and mental clarity. Discover evidence-based strategies for better rest.",
      category: "Sleep",
      readTime: 8,
      date: "2024-01-12",
      url: "https://www.sleepfoundation.org/mental-health",
    },
    {
      id: 5,
      title: "Building Resilience: Bouncing Back from Life's Challenges",
      excerpt: "Resilience isn't about avoiding stress—it's about learning to navigate it. Practical tools to strengthen your mental fortitude.",
      category: "Resilience",
      readTime: 6,
      date: "2024-01-11",
      url: "https://www.apa.org/topics/resilience",
    },
    {
      id: 6,
      title: "The Connection Between Exercise and Mood",
      excerpt: "Physical activity releases endorphins and reduces stress hormones. Learn how movement can transform your mental state.",
      category: "Wellness",
      readTime: 5,
      date: "2024-01-10",
      url: "https://www.mentalhealth.org.uk/explore-mental-health/publications/physical-activity-mental-health",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Daily Mental Health Readings
        </h1>
        <p className="text-gray-600 text-lg">
          Curated articles to inspire and educate your wellness journey
        </p>
      </div>

      <div className="space-y-6">
        {readings.map((reading, index) => (
          <article
            key={reading.id}
            className="group relative animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full">
                      {reading.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <time>{new Date(reading.date).toLocaleDateString()}</time>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{reading.readTime} min read</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {reading.title}
                  </h2>

                  <p className="text-gray-600 leading-relaxed mb-4">
                    {reading.excerpt}
                  </p>

                  <a
                    href={reading.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-purple-600 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Full Article</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="hidden sm:block">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          These articles are sourced from reputable mental health organizations and research institutions.
        </p>
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
