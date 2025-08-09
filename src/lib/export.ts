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
        skullKing_positive: res.specialCards.skullKing?.positive ?? 0,
        skullKing_negative: res.specialCards.skullKing?.negative ?? 0,
        second_positive: res.specialCards.second?.positive ?? 0,
        second_negative: res.specialCards.second?.negative ?? 0,
        pirates_positive: res.specialCards.pirates?.positive ?? 0,
        pirates_negative: res.specialCards.pirates?.negative ?? 0,
        mermaids_positive: res.specialCards.mermaids?.positive ?? 0,
        mermaids_negative: res.specialCards.mermaids?.negative ?? 0,
        coins_positive: res.specialCards.coins?.positive ?? 0,
        coins_negative: res.specialCards.coins?.negative ?? 0,
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
        SkullKing_positive: res.specialCards.skullKing?.positive ?? 0,
        SkullKing_negative: res.specialCards.skullKing?.negative ?? 0,
        Second_positive: res.specialCards.second?.positive ?? 0,
        Second_negative: res.specialCards.second?.negative ?? 0,
        Pirates_positive: res.specialCards.pirates?.positive ?? 0,
        Pirates_negative: res.specialCards.pirates?.negative ?? 0,
        Mermaids_positive: res.specialCards.mermaids?.positive ?? 0,
        Mermaids_negative: res.specialCards.mermaids?.negative ?? 0,
        Coins_positive: res.specialCards.coins?.positive ?? 0,
        Coins_negative: res.specialCards.coins?.negative ?? 0,
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
