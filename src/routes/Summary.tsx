import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import { useStore } from '../store/useStore';
import { exportCSV, exportXLSX } from '../lib/export';
import { formatDate } from '../lib/utils';

type PlayerRoundView = {
  bid?: number;
  harry?: number;
  tricks?: number;
  bonus?: number;
  score?: number;
};

export default function Summary() {
  const { gameId } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { unlockRound } = useStore();

if (!game) return <Layout title="Chargement">Chargement…</Layout>;

  // Show date if available
  const gameDate = game.date || (game.createdAt ? formatDate(game.createdAt) : '');
  
  // Display date in header
  const displayDate = gameDate ? ` - ${gameDate}` : '';

  // Totals
  const totals: Record<string, number> = {};
  for (const p of game.players) totals[p.id] = 0;
  for (const r of rounds) {
    for (const [pid, res] of Object.entries(r.results) as [
      string,
      { score?: number }
    ][]) {
      totals[pid] += res?.score ?? 0;
    }
  }

  // Accumulated scores
  const accumulatedScores: Record<string, number[]> = {};
  for (const p of game.players) {
    accumulatedScores[p.id] = [];
  }
  
  for (let i = 0; i < game.totalRounds; i++) {
    const roundNumber = i + 1;
    for (const p of game.players) {
      const r = rounds.find((rr) => rr.roundNumber === roundNumber);
      if (!r) {
        accumulatedScores[p.id].push(accumulatedScores[p.id][i-1] || 0);
      } else {
        const score = r.results[p.id]?.score ?? 0;
        const prevScore = accumulatedScores[p.id][i-1] || 0;
        accumulatedScores[p.id].push(prevScore + score);
      }
    }
  }

  // Ranking
  const ranking = [...game.players]
    .map((p) => ({ ...p, total: totals[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const rankIcon = (i: number) =>
    i === 0 ? '👑' : i === 1 ? '🏴‍☠️' : i === 2 ? '🧜‍♀️' : i === 3 ? '👶' : '';

  const cellData = (roundNumber: number, playerId: string): PlayerRoundView => {
    const r = rounds.find((rr) => rr.roundNumber === roundNumber);
    if (!r) return {};
    const bid = r.bids[playerId]?.bid;
    const harry = r.bids[playerId]?.betAdjustedByHarry ?? 0;
    const res = r.results[playerId];
    return {
      bid,
      harry,
      tricks: res?.tricks,
      bonus: res?.bonus,
      score: res?.score
    };
  };

  const goToRound = (n: number) => nav(`/game/${game.id}/round/${n}/results`);
  const goToBids = (n: number) => nav(`/game/${game.id}/round/${n}/bets`);

  const doCSV = () => {
    const blob = exportCSV(game, rounds);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skullking_${game.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doXLSX = () => {
    const blob = exportXLSX(game, rounds);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skullking_${game.id}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isCompleted = game.status === 'completed';

  return (
    <Layout
      title={`Résumé${displayDate}`}
      right={
        <Link
          className="btn btn-ghost"
          to={`/game/${game.id}/round/${game.currentRound}/bets`}
        >
          Retour
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Ranking + exports when completed */}
        <div className="card p-4">
          <div className="text-lg font-semibold mb-2">Classement actuel</div>
          <ol className="space-y-1">
            {ranking.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  {i + 1}. <span className="ml-1">{rankIcon(i)}</span> {p.name}
                </span>
                <span className="font-medium tabular-nums">{p.total}</span>
              </li>
            ))}
          </ol>

          {isCompleted ? (
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={doCSV}>
                Exporter CSV
              </button>
              <button className="btn btn-ghost" onClick={doXLSX}>
                Exporter Excel
              </button>
            </div>
          ) : (
            <div className="mt-3 text-sm opacity-80">
              Partie en cours — Manche {game.currentRound}/{game.totalRounds}
            </div>
          )}
        </div>

        {/* Per-round detailed table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] relative">
            <table className="w-full text-left">
              <thead className="bg-opacity-100 bg-surface sticky top-0 z-20 shadow-lg ">
                <tr className="text-sm">
                  <th className="px-3 py-3 w-20">Manche</th>
                  {game.players.map((p) => (
                    <th key={p.id} className="px-2 py-3 min-w-[200px]">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] opacity-60 mt-0.5">
                        Pari · Harry · Plis
                        <span className="mx-2">|</span>
                        Bonus · Score
                      </div>
                    </th>
                  ))}
                  <th className="px-2 py-3 w-40"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {Array.from({ length: game.totalRounds }, (_, i) => i + 1).map(
                  (n) => {
                    const r = rounds.find((rr) => rr.roundNumber === n);
                    const locked = r?.locked ?? false;
                    return (
                      <tr
                        key={n}
                        className={`${
                          n === game.currentRound ? 'bg-accent/10' : 'odd:bg-whiteA-2'
                        }`}
                      >
                        <td className="px-3 py-3 align-top font-medium">
                          {n}
                        </td>
                        {game.players.map((p) => {
                          const d = cellData(n, p.id);
                          const bonus = d.bonus ?? 0;
                          const score = d.score;
                          const accumulatedScore = accumulatedScores[p.id][n - 1];
                          return (
                            <td key={p.id} className="px-2 py-2 align-top">
                              {d.bid !== undefined ? (
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-block rounded-full bg-surface/70 px-2 py-0.5">
                                      Pari:
                                      <span className="font-mono ml-1">
                                        {d.bid}
                                      </span>
                                      {d.harry ? (
                                        <span className="font-mono ml-1 opacity-80">
                                          ({d.harry > 0 ? '+1' : '-1'})
                                        </span>
                                      ) : null}
                                    </span>
                                    <span className="inline-block rounded-full bg-surface/70 px-2 py-0.5">
                                      Plis:
                                      <span className="font-mono ml-1">
                                        {d.tricks ?? '—'}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-block rounded-full bg-surface/70 px-2 py-0.5">
                                      Bonus:
                                      <span className="font-mono ml-1">
                                        {bonus > 0 ? `+${bonus}` : bonus}
                                      </span>
                                    </span>
                                    <span
                                      className={`inline-block rounded-full px-2 py-0.5 font-mono ${
                                        (score ?? 0) >= 0
                                          ? 'bg-emerald-800/50 text-emerald-100'
                                          : 'bg-rose-800/50 text-rose-100'
                                      }`}
                                    >
                                      {score !== undefined
                                        ? score >= 0
                                          ? `+${score}`
                                          : score
                                        : '—'}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <span className="text-xs opacity-70">Cumulé:</span>{' '}
                                    <span className={`font-mono ${
                                      accumulatedScore >= 0
                                        ? 'text-emerald-600'
                                        : 'text-rose-600'
                                    }`}>
                                      {accumulatedScore >= 0 ? `+${accumulatedScore}` : accumulatedScore}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="opacity-50">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 align-top">
                          <div className="flex gap-2">
                            {locked ? (
                              <>
                                <button
                                  className="btn btn-ghost"
                                  onClick={async () => {
                                    await unlockRound(game.id, n);
                                    goToBids(n);
                                  }}
                                  title="Modifier les paris"
                                >
                                  Paris
                                </button>
                                <button
                                  className="btn btn-ghost"
                                  onClick={async () => {
                                    await unlockRound(game.id, n);
                                    goToRound(n);
                                  }}
                                  title="Modifier les résultats"
                                >
                                  Résultats
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-ghost"
                                  onClick={() => goToBids(n)}
                                  title="Modifier les paris"
                                >
                                  Paris
                                </button>
                                <button
                                  className="btn btn-ghost"
                                  onClick={() => goToRound(n)}
                                  title="Modifier les résultats"
                                >
                                  Résultats
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
                <tr className="border-t border-whiteA-5 bg-whiteA-5">
                  <td className="px-3 py-3 font-semibold">Total</td>
                  {game.players.map((p) => (
                    <td key={p.id} className="px-2 py-3 font-semibold font-mono">
                      {totals[p.id]}
                    </td>
                  ))}
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
