import { Star, Quote, CheckCircle, Award, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Book Blogger & Content Creator",
    content: "BookWorm transformed how I track my reading. The personalized recommendations are spot-on!",
    rating: 5,
    image: "SJ",
    stats: "Read 120 books this year"
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    content: "As someone who reads both fiction and technical books, the organization features are incredible.",
    rating: 5,
    image: "MC",
    stats: "50 books in library"
  },
  {
    name: "Emma Rodriguez",
    role: "University Professor",
    content: "The reading analytics helped me understand my patterns and read more consistently.",
    rating: 4,
    image: "ER",
    stats: "3000 pages tracked"
  },
  {
    name: "David Wilson",
    role: "Marketing Director",
    content: "Setting reading goals and tracking progress with visual charts kept me motivated all year.",
    rating: 5,
    image: "DW",
    stats: "Goal: 52 books/year"
  },
  {
    name: "Lisa Thompson",
    role: "Librarian",
    content: "Perfect for managing my personal and professional reading. The community features are great!",
    rating: 5,
    image: "LT",
    stats: "25 years of reading"
  },
  {
    name: "James Miller",
    role: "Author",
    content: "I use BookWorm to research reader preferences and trends. The data insights are invaluable.",
    rating: 4,
    image: "JM",
    stats: "Published 3 books"
  }
];

const achievements = [
  { icon: Award, value: "Best Reading App 2024", category: "Education" },
  { icon: TrendingUp, value: "#1 in App Store", category: "Productivity" },
  { icon: CheckCircle, value: "Editor's Choice", category: "Google Play" },
  { icon: Star, value: "4.9/5 Stars", category: "User Reviews" }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Readers Everywhere
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from our community of passionate readers who have transformed their reading habits.
          </p>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-card border rounded-xl p-4 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <achievement.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="font-bold text-lg mb-1">{achievement.value}</div>
              <div className="text-sm text-muted-foreground">{achievement.category}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border rounded-xl p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-muted-foreground mb-6 italic">{testimonial.content}</p>
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {testimonial.image}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium text-primary flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {testimonial.stats}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg font-medium">User Satisfaction</div>
              <div className="text-sm text-muted-foreground">Based on 10K+ reviews</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.7x</div>
              <div className="text-lg font-medium">More Reading Time</div>
              <div className="text-sm text-muted-foreground">Average increase per user</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">89%</div>
              <div className="text-lg font-medium">Goals Achieved</div>
              <div className="text-sm text-muted-foreground">Reading targets completed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}