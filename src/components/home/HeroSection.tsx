import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 h-96 w-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 h-96 w-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                <span>Transform Your Reading Journey</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Discover Your Next <span className="text-primary">Favorite Book</span> with AI
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                BookWorm is your personal reading companion. Track progress, get smart recommendations, 
                and join a community of passionate readers. Make every page count.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">10K+</span>
                </div>
                <p className="text-sm text-muted-foreground">Books Catalog</p>
              </div>
              <div className="space-y-1">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-bold">4.8</span>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <div className="space-y-1">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-bold">50K+</span>
                <p className="text-sm text-muted-foreground">Active Readers</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="gap-2">
                Start Reading Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Tutorial
              </Button>
            </div>
          </div>

          {/* Right - Hero Image/Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Main Book Stack */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-card border rounded-2xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    {/* Book Cards */}
                    <div className="flex items-start gap-4">
                      <div className="relative h-32 w-24 rounded-lg overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm">
                          <p className="text-xs text-white font-medium">The Alchemist</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold">Personalized Shelf</h3>
                        <p className="text-sm text-muted-foreground">Add books to Want to Read, Currently Reading, or Read shelves</p>
                        <div className="flex gap-2">
                          <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Fiction</div>
                          <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Adventure</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Reading Progress</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-2/3"></div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Recommended For You</h4>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-9 bg-primary/20 rounded"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Atomic Habits</p>
                          <p className="text-xs text-muted-foreground">Based on your reading history</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">4.9/5</p>
                    <p className="text-xs text-muted-foreground">Avg Review</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">+125%</p>
                    <p className="text-xs text-muted-foreground">Reading Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}