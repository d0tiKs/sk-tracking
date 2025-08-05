export type UUID = string;

export interface Player {
  id: UUID;
  name: string;
  color?: string;
  emoji?: string;
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
  betAdjustedByHarry?: -1 | 0 | 1;
}

export interface RoundResultPerPlayer {
  tricks: number;
  bonus: number;
  specialCards: {
    skullKing?: number;
    second?: number;
    pirates?: number;
    mermaids?: number;
    coins?: number;
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