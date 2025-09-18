export type UUID = string;

export interface Player {
  id: UUID;
  name: string;
}

export type GameStatus = 'in-progress' | 'completed';

export interface Game {
  id: UUID;
  createdAt: number;
  updatedAt: number;
  status: GameStatus;
  players: Player[];
  totalRounds: number;
  currentRound: number;
  scoringPresetId: string;
  notes?: string;
  date?: string;
}

export interface RoundBid {
  playerId: UUID;
  bid: number;
  betAdjustedByHarry?: -2 | -1 | 0 | 1 | 2;
}

export interface RoundResultPerPlayer {
  tricks: number;
  bonus: number;
  specialCards: {
    skullKing: { positive: 0, negative: 0 },
    second: { positive: 0, negative: 0 },
    pirates: { positive: 0, negative: 0 },
    mermaids: { positive: 0, negative: 0 },
    babyPirates: { positive: 0, negative: 0 },
    coins: { positive: 0, negative: 0 },
    beasts: { positive: 0, negative: 0 },
    rascalGamble: { positive: 0, negative: 0 },
    punishment: { negative: 0 },
    escapes?: number;
  };
  score: number;
}

export interface Round {
  id: UUID;
  gameId: UUID;
  roundNumber: number;
  bids: Record<UUID, RoundBid>;
  results: Record<UUID, RoundResultPerPlayer>;
  locked?: boolean;
}