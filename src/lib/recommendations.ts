import type { Book } from '@/types/book';

export function calculateMatchScore(params: {
  averageRating?: number;
  totalShelves?: number;
  readCountForGenre?: number;
  base?: number;
}) {
  const base = params.base ?? 65;
  const ratingBonus = Math.min((params.averageRating || 0) * 4, 20);
  const popularityBonus = Math.min((params.totalShelves || 0) / 100, 10);
  const genreBoost = params.readCountForGenre && params.readCountForGenre > 0 ? Math.min(params.readCountForGenre * 3, 10) : 0;
  const rawScore = base + ratingBonus + popularityBonus + genreBoost;
  const matchScore = Math.round(Math.min(Math.max(rawScore, 50), 98));
  return matchScore;
}

export function generateReason(book: any, options?: { matchedGenre?: string; readCountForGenre?: number; fallback?: boolean; }) {
  if (options?.fallback) {
    return {
      reason: `Popular or trending${book.averageRating ? ` — ${book.averageRating.toFixed(1)}★` : ''}`,
      reasonDetails: {
        fallback: true,
        communityRating: book.averageRating || 0,
        popularity: book.totalShelves || 0
      }
    };
  }

  const reasons = [
    `Matches your preference for ${options?.matchedGenre || 'this genre'} (${options?.readCountForGenre || 0} reads)`,
    `Highly rated by the community (${(book.averageRating || 0).toFixed(1)}★)`,
    `Popular among readers (${book.totalShelves || 0} adds)`,
    `Similar to books you've enjoyed`
  ];

  const reason = reasons[Math.floor(Math.random() * reasons.length)];

  return {
    reason,
    reasonDetails: {
      matchedGenre: options?.matchedGenre,
      readCountForGenre: options?.readCountForGenre || 0,
      communityRating: book.averageRating || 0,
      popularity: book.totalShelves || 0
    }
  };
}

export function getRecommendations(_userId?: string): Book[] {
  // Simple placeholder: return empty list. Main logic is in the API route for now.
  return [];
}

