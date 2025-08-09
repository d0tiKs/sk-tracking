export function normalizeSpecialCards(cards: Record<string, { positive: number, negative: number } | number>): Record<string, { positive: number, negative: number }> {
  const normalized: Record<string, { positive: number, negative: number }> = {};
  
  for (const [key, value] of Object.entries(cards)) {
    if (typeof value === 'number') {
      // Old format: number
      normalized[key] = { positive: value, negative: 0 };
    } else if (typeof value === 'object' && value !== null) {
      // New format: object with positive and negative
      normalized[key] = { ...value };
    } else {
      // Fallback: treat as zero
      normalized[key] = { positive: 0, negative: 0 };
    }
  }
  
  return normalized;
}