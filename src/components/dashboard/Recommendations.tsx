import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Popover from '@/components/ui/popover';

type Recommendation = {
  book: any;
  reason: string;
  reasonDetails?: any;
  matchScore: number;
};

export default function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
          <BookOpenPlaceholder />
        </div>
        <h3 className="font-semibold mb-2">No recommendations yet</h3>
        <p className="text-muted-foreground">Add more books to your library to get personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {recommendations.map((rec) => (
        <div key={rec.book._id} className="p-3 border rounded-lg hover:shadow-sm transition-colors bg-card">
          <div className="relative w-full h-40 mb-3 rounded overflow-hidden">
            <Image src={rec.book.coverImage} alt={rec.book.title} fill className="object-cover" sizes="200px" />
          </div>
          <Link href={`/browse/${rec.book._id}`} className="font-medium line-clamp-2 hover:text-primary">
            {rec.book.title}
          </Link>
          <p className="text-xs text-muted-foreground">by {rec.book.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{rec.book.genre?.name}</Badge>
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{(rec.book.averageRating || 0).toFixed(1)}</span>
            </div>
            <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary">{rec.matchScore}% match</Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <Popover label={<span className="underline text-[11px]">Why?</span>}>
              <div className="font-medium mb-1">{rec.reason}</div>
              {rec.reasonDetails && (
                <div className="space-y-1 text-[12px] text-muted-foreground">
                  {rec.reasonDetails.matchedGenre && (
                    <div>Matched genre: {rec.reasonDetails.matchedGenre} ({rec.reasonDetails.readCountForGenre || 0} reads)</div>
                  )}
                  {typeof rec.reasonDetails.communityRating !== 'undefined' && (
                    <div>Community rating: {(rec.reasonDetails.communityRating || 0).toFixed(1)}★</div>
                  )}
                  {typeof rec.reasonDetails.popularity !== 'undefined' && (
                    <div>Popularity: {rec.reasonDetails.popularity} adds</div>
                  )}
                </div>
              )}
            </Popover>
            <span className="truncate">{rec.reason}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookOpenPlaceholder() {
  // lightweight placeholder for icon used in empty state
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4h9a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 18H6a2 2 0 01-2-2V6a2 2 0 012-2h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
