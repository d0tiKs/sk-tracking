import { Game, Round } from '../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { formatDate } from '../lib/utils';

export function exportCSV(game: Game, rounds: Round[]) {
  const rows: any[] = [];
  for (const r of rounds) {
    for (const [playerId, res] of Object.entries(r.results)) {
      const bid = r.bids[playerId]?.bid ?? 0;
      const adj = r.bids[playerId]?.betAdjustedByHarry ?? 0;
      
      // Find player name by ID
      const player = game.players.find(p => p.id === playerId);
      const playerName = player ? player.name : playerId; // fallback to ID if not found
      
      rows.push({
        gameId: game.id,
        date: game.date || formatDate(game.createdAt),
        round: r.roundNumber,
        playerName,
        playerId,
        bid,
        adjustedBid: bid + adj,
        tricks: res.tricks,
        bonus: res.bonus,
        skullKing: res.specialCards.skullKing ?? 0,
        second: res.specialCards.second ?? 0,
        pirates: res.specialCards.pirates ?? 0,
        mermaids: res.specialCards.mermaids ?? 0,
        coins: res.specialCards.coins ?? 0,
        score: res.score
      });
    }
  }
  const csv = Papa.unparse(rows);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export function exportXLSX(game: Game, rounds: Round[]) {
  const rows: any[] = [];
  for (const r of rounds) {
    for (const [playerId, res] of Object.entries(r.results)) {
      const bid = r.bids[playerId]?.bid ?? 0;
      const adj = r.bids[playerId]?.betAdjustedByHarry ?? 0;
      
      // Find player name by ID
      const player = game.players.find(p => p.id === playerId);
      const playerName = player ? player.name : playerId; // fallback to ID if not found
      
      rows.push({
        Round: r.roundNumber,
        Date: game.date || formatDate(game.createdAt),
        PlayerName: playerName,
        PlayerId: playerId,
        Bid: bid,
        AdjustedBid: bid + adj,
        Tricks: res.tricks,
        Bonus: res.bonus,
        SkullKing: res.specialCards.skullKing ?? 0,
        Second: res.specialCards.second ?? 0,
        Pirates: res.specialCards.pirates ?? 0,
        Mermaids: res.specialCards.mermaids ?? 0,
        Coins: res.specialCards.coins ?? 0,
        Score: res.score
      });
    }
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scores');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}
