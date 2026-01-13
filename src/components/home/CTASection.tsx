import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, BookOpen, CheckCircle, Star } from 'lucide-react';

const features = [
  "AI-powered book recommendations",
  "Personal reading tracker with progress",
  "Community reviews and ratings",
  "Reading goals and challenges",
  "Admin dashboard for management",
  "Mobile responsive design",
  "Secure authentication system",
  "Real-time reading statistics"
];

export default function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary blur-3xl"></div>
        </div>
      </div>

      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">Limited Time Offer</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Start Your Reading Journey Today
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-8">
                    Join thousands of readers who have transformed their reading habits with BookWorm. 
                    Get personalized recommendations, track your progress, and achieve your reading goals.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border rounded-xl p-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">Free</span>
                    <span className="text-muted-foreground">forever</span>
                  </div>
                  <p className="text-muted-foreground mb-4">Start with all essential features</p>
                  <Button size="lg" className="w-full gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Right - Visual Card */}
              <div className="relative">
                <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 border rounded-2xl p-8">
                  {/* Floating Badges */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-lg">
                    Most Popular
                  </div>
                  
                  <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold">Reading Stats</div>
                          <div className="text-sm text-muted-foreground">Your monthly overview</div>
                        </div>
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold">12</div>
                          <div className="text-sm text-muted-foreground">Books Read</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">3,456</div>
                          <div className="text-sm text-muted-foreground">Pages</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Reading Goal</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-4/5"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Card */}
                    <div className="border rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Star className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold">Featured Review</div>
                          <div className="text-sm text-muted-foreground">This months top reader</div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground italic mb-4">
                        BookWorm helped me read 50+ books this year. The tracking features kept me motivated!
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <div className="font-medium">Alex Johnson</div>
                          <div className="text-muted-foreground">Book Blogger</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">4.9</div>
                          <div className="text-sm text-muted-foreground">Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-xl"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-primary/10 blur-xl"></div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t">
              <div className="text-center text-sm text-muted-foreground mb-6">
                Trusted by readers from top organizations
              </div>
              <div className="flex flex-wrap justify-center gap-8 opacity-60">
                <div className="text-lg font-bold">📚 Harvard Library</div>
                <div className="text-lg font-bold">🎓 Stanford Readers</div>
                <div className="text-lg font-bold">🏛️ NY Public Library</div>
                <div className="text-lg font-bold">📖 Goodreads Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}