import { create } from 'zustand';
import { db } from '../lib/db';
import { Game, Round, UUID } from '../types';
import { uid } from '../lib/utils';

interface StoreState {
  games: Game[];
  currentGame?: Game;
  rounds: Round[];
  loadGames: () => Promise<void>;
  loadGame: (id: UUID) => Promise<void>;
  createGame: (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentRound'>) => Promise<UUID>;
  upsertRound: (r: Round) => Promise<void>;
  completeGame: (id: UUID) => Promise<void>;
  deleteGame: (id: UUID) => Promise<void>;
  setCurrentRound: (n: number) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  games: [],
  rounds: [],
  async loadGames() {
    const games = await db.games.orderBy('updatedAt').reverse().toArray();
    set({ games });
  },
  async loadGame(id) {
    const game = await db.games.get(id);
    const rounds = await db.rounds.where('gameId').equals(id).sortBy('roundNumber');
    set({ currentGame: game, rounds });
  },
  async createGame(partial) {
    const id = uid();
    const game: Game = {
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'in-progress',
      players: partial.players,
      totalRounds: partial.totalRounds,
      currentRound: 1,
      scoringPresetId: partial.scoringPresetId
    };
    await db.games.add(game);
    await get().loadGames();
    return id;
  },
  async upsertRound(r) {
    await db.rounds.put(r);
    await db.games.update(r.gameId, { updatedAt: Date.now() });
    await get().loadGame(r.gameId);
  },
  async completeGame(id) {
    await db.games.update(id, { status: 'completed', updatedAt: Date.now() });
    await get().loadGames();
    await get().loadGame(id);
  },
  async deleteGame(id) {
    await db.transaction('rw', db.games, db.rounds, async () => {
      await db.rounds.where('gameId').equals(id).delete();
      await db.games.delete(id);
    });
    await get().loadGames();
  },
  async setCurrentRound(n) {
    const g = get().currentGame;
    if (!g) return;
    await db.games.update(g.id, { currentRound: n, updatedAt: Date.now() });
    await get().loadGame(g.id);
  }
}));