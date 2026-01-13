import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:pt-32 overflow-hidden">
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Track Your{' '}
            <span className="text-primary">Job Applications</span>
            <br />
            Flexibility in Job-Tracker
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Stay organized, never miss a follow-up, and land your dream job—all in one beautifully organized workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/features">See Features</Link>
            </Button>
          </div>

          {/* ✅ Image from public folder */}
          <div className="relative w-full max-w-2xl mx-auto">
            <Image
              src="/book.png"
              alt="Job tracking dashboard preview"
              width={100}
              height={100}
              className="rounded-xl shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
