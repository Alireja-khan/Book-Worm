import Link from 'next/link';
import { Book, BookOpen } from 'lucide-react';

interface LogoProps {
  href?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function Logo({ href = "/", showIcon = true, showText = true }: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2">
      {showIcon && (
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      {showText && (
        <span className="font-bold text-xl">BookWorm</span>
      )}
    </Link>
  );
}