import { ScoringConfig } from '../config/scoringConfig';

export function calculateScore(
  bid: number,
  tricks: number,
  roundNumber: number,
  bonus: number,
  config: ScoringConfig
): number {
  if (bid === 0) {
    return tricks === 0
      ? config.zeroBidMultiplier * roundNumber + bonus
      : -config.zeroBidFailMultiplier * roundNumber + bonus;
  }
  if (bid === tricks) {
    return bid * config.pointsPerSuccessfulTrick + bonus;
  }
  const diff = Math.abs(bid - tricks);
  return -diff * config.failedBidPenaltyPerTrick + bonus;
}

export function computeBonusFromSpecials(
  specials: Record<string, number | undefined>,
  config: ScoringConfig
): number {
  let sum = 0;
  for (const [key, count] of Object.entries(specials)) {
    const n = count ?? 0;
    const rule = config.specials[key];
    if (!rule) continue;
    if (rule.points) sum += n * rule.points;
  }
  return sum;
}