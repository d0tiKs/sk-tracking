import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import { exportCSV, exportXLSX } from '../lib/export';

export default function Final() {
  const { gameId } = useParams();
  const { game, rounds } = useGame(gameId);

  if (!game) return null;

  const totals: Record<string, number> = {};
  for (const p of game.players) totals[p.id] = 0;
  for (const r of rounds) {
    for (const [pid, res] of Object.entries(r.results))
      totals[pid] += res.score ?? 0;
  }
  const ranking = [...game.players].sort(
    (a, b) => totals[b.id] - totals[a.id]
  );

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
              <li key={p.id}>
                {i + 1}. {p.name} — {totals[p.id]} pts
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
          <div className="text-lg font-semibold mb-2">Historique</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-2 py-2">Manche</th>
                  {game.players.map((p) => (
                    <th key={p.id} className="px-2 py-2">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id}>
                    <td className="px-2 py-1">{r.roundNumber}</td>
                    {game.players.map((p) => (
                      <td key={p.id} className="px-2 py-1">
                        {r.results[p.id]?.score ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}