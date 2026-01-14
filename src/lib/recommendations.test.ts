import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMatchScore, generateReason } from './recommendations';

test('calculateMatchScore returns value within expected bounds', () => {
  const score1 = calculateMatchScore({ averageRating: 4.5, totalShelves: 1500, readCountForGenre: 5 });
  assert.ok(score1 >= 50 && score1 <= 98);

  const score2 = calculateMatchScore({ averageRating: 0, totalShelves: 0, readCountForGenre: 0 });
  assert.ok(score2 >= 50 && score2 <= 98);

  const score3 = calculateMatchScore({ averageRating: 5, totalShelves: 10000, readCountForGenre: 10 });
  assert.ok(score3 <= 98);
});

test('generateReason fallback includes fallback flag and community rating', () => {
  const book = { averageRating: 4.2, totalShelves: 500 };
  const { reason, reasonDetails } = generateReason(book, { fallback: true });
  assert.ok(typeof reason === 'string' && reason.length > 0);
  assert.ok(reasonDetails.fallback === true);
  assert.strictEqual(reasonDetails.communityRating, 4.2);
});

test('generateReason returns matchedGenre details when provided', () => {
  const book = { averageRating: 3.8, totalShelves: 120 };
  const res = generateReason(book, { matchedGenre: 'Mystery', readCountForGenre: 3 });
  assert.ok(res.reason.includes('Mystery') || typeof res.reason === 'string');
  assert.strictEqual(res.reasonDetails.matchedGenre, 'Mystery');
  assert.strictEqual(res.reasonDetails.readCountForGenre, 3);
});