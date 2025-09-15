export interface SpecialRule {
  id: string;
  icon: string;
  label: string;
  points?: number;
}

export interface ScoringConfig {
  pointsPerSuccessfulTrick: number;
  failedBidPenaltyPerTrick: number;
  zeroBidMultiplier: number;
  zeroBidFailMultiplier: number;
  allowHarryAdjustment: boolean;
  specials: Record<string, SpecialRule>;
  // hooks for more detailed rule interactions if later desired
}

export const standardScoring: ScoringConfig = {
  pointsPerSuccessfulTrick: 20,
  failedBidPenaltyPerTrick: 10,
  zeroBidMultiplier: 10,
  zeroBidFailMultiplier: 10,
  allowHarryAdjustment: true,
  specials: {
    skullKing: { id: 'skullKing', icon: '💀👑', label: 'Skull King' },
    second: { id: 'second', icon: '🦜', label: 'Second' },
    pirates: { id: 'pirates', icon: '🏴‍☠️', label: 'Pirate' },
    mermaids: { id: 'mermaids', icon: '🧜‍♀️', label: 'Mermaid' },
    coins: { id: 'coins', icon: '🪙', label: 'Coin', points: 10 },
    beasts: { id: 'beasts', icon: '🦑', label: 'Monstre' },
    rascalGamble: { id: 'rascalGamble', icon: '🎰', label: 'Rascal Gamble' },
    punishment: { id: 'punishment', icon: '🚩', label: 'Punition' }
  }
};

export const presets = {
  standard: standardScoring
};