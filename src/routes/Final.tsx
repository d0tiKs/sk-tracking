import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import { exportCSV, exportXLSX } from '../lib/export';

type PlayerRoundView = {
  bid?: number;
  harry?: number;
  tricks?: number;
  bonus?: number;
  score?: number;
};

export default function Final() {
  const { gameId } = useParams();
  const { game, rounds } = useGame(gameId);

  if (!game) return null;

  const rankIcon = (i: number) =>
    i === 0 ? '👑' : i === 1 ? '🏴‍☠️' : i === 2 ? '🧜‍♀️' : i === 3 ? '👶' : '';

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

  const ranking = [...game.players].sort(
    (a, b) => totals[b.id] - totals[a.id]
  );

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

  return (
    <Layout title="Résultat final">
      <div className="space-y-6">
        <div className="card p-4">
          <div className="text-xl font-semibold mb-2">Classement</div>
         <ol className="pl-6 space-y-1">
            {ranking.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  {i + 1}.<span className="ml-1">{rankIcon(i)}</span> {p.name}{' '}
                </span>
                <span className="font-mono">{totals[p.id]} pts</span>
              </li>
            ))}
          </ol>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary" onClick={doCSV}>
              Exporter CSV
            </button>
            <button className="btn btn-ghost" onClick={doXLSX}>
              Exporter Excel
            </button>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-lg font-semibold mb-2">Historique détaillé</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-2 py-2">Manche</th>
                  {game.players.map((p) => (
                    <th key={p.id} className="px-2 py-2">
                      {p.name}
                      <div className="text-[11px] opacity-60 font-normal mt-1">
                        Bid · Harry · Tricks · Bonus · Score
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: game.totalRounds }, (_, i) => i + 1).map(
                  (n) => (
                    <tr key={n}>
                      <td className="px-2 py-1">{n}</td>
                      {game.players.map((p) => {
                        const d = cellData(n, p.id);
                        return (
                          <td
                            key={p.id}
                            className="px-2 py-1 align-top leading-tight"
                          >
                            {d.bid !== undefined ? (
                              <div className="text-sm tabular-nums">
                                <span className="mr-2">
                                  {d.bid}
                                  {d.harry
                                    ? ` (${d.harry > 0 ? '+1' : '-1'})`
                                    : ''}
                                </span>
                                <span className="mr-2">
                                  · {d.tricks ?? ''}
                                </span>
                                <span className="mr-2">
                                  · {d.bonus ? (d.bonus > 0 ? `+${d.bonus}` : d.bonus) : 0}
                                </span>
                                <span className="font-medium">
                                  · {d.score !== undefined ? d.score : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="opacity-50 text-sm">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )
                )}
                <tr className="border-t border-white/10 bg-white/5">
                  <td className="px-2 py-2 font-semibold">Total</td>
                  {game.players.map((p) => (
                    <td key={p.id} className="px-2 py-2 font-semibold">
                      {totals[p.id]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}