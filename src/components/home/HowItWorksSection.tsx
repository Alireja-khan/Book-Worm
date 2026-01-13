import { BookOpen, Search, Star, TrendingUp, Target, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Create Your Profile",
    description: "Sign up and set up your reading preferences, favorite genres, and reading goals.",
    color: "border-blue-500/30",
    iconColor: "text-blue-500"
  },
  {
    number: "02",
    icon: Search,
    title: "Discover Books",
    description: "Browse our extensive library or get AI-powered recommendations based on your taste.",
    color: "border-purple-500/30",
    iconColor: "text-purple-500"
  },
  {
    number: "03",
    icon: Star,
    title: "Build Your Library",
    description: "Add books to your Want to Read, Currently Reading, or Read shelves.",
    color: "border-green-500/30",
    iconColor: "text-green-500"
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track Progress",
    description: "Log your reading sessions, update page counts, and monitor your reading stats.",
    color: "border-orange-500/30",
    iconColor: "text-orange-500"
  },
  {
    number: "05",
    icon: Target,
    title: "Set Goals",
    description: "Create annual reading challenges and track your progress with visual indicators.",
    color: "border-red-500/30",
    iconColor: "text-red-500"
  },
  {
    number: "06",
    icon: Users,
    title: "Join Community",
    description: "Share reviews, follow other readers, and discover books through social features.",
    color: "border-pink-500/30",
    iconColor: "text-pink-500"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Simple & Effective</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How BookWorm Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes and transform your reading habits with our intuitive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="relative bg-card border rounded-xl p-6 h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl border-2 ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                
                {/* Decorative Line */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-1 bg-primary/20 rounded-full"></div>
                </div>
              </div>
              
              {/* Connecting Lines for Desktop */}
              {index < steps.length - 1 && (
                <>
                  <div className="hidden lg:block absolute top-1/2 right-0 w-full h-1 bg-gradient-to-r from-primary/20 to-transparent -translate-y-1/2 translate-x-1/2"></div>
                  <div className="hidden lg:block absolute top-1/2 right-0 w-4 h-4 rounded-full bg-primary/30 -translate-y-1/2 translate-x-1/2"></div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card border rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">Ready to Start Your Journey?</h3>
              <p className="text-muted-foreground">Join thousands of readers who have transformed their reading habits</p>
            </div>
            <div className="flex-shrink-0">
              <Button size="lg" className="gap-2">
                Get Started Free
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}