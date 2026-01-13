import { BookOpen, Brain, BarChart3, Users, Shield, Sparkles, Target, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Get personalized book suggestions based on your reading history, ratings, and preferences.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    icon: BookOpen,
    title: "Smart Reading Tracker",
    description: "Track progress across Want to Read, Currently Reading, and Read shelves with detailed insights.",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    icon: Users,
    title: "Community Reviews",
    description: "Read and write reviews, follow other readers, and discover books through community ratings.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    icon: BarChart3,
    title: "Reading Analytics",
    description: "Visualize your reading habits with detailed charts, stats, and progress tracking.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: Shield,
    title: "Admin Dashboard",
    description: "Comprehensive tools for managing books, users, genres, and moderating reviews.",
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  {
    icon: Target,
    title: "Reading Goals",
    description: "Set and track annual reading goals with progress bars and achievement badges.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10"
  },
  {
    icon: Sparkles,
    title: "Personal Library",
    description: "Build your digital bookshelf with custom categories and easy organization.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
  {
    icon: TrendingUp,
    title: "Progress Insights",
    description: "Monitor reading streaks, pages per day, and genre distribution over time.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Your Reading Journey
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to enhance your reading experience and help you discover your next favorite book.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs font-medium text-primary">Learn more →</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}