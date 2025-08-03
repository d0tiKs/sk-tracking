import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { gameId } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { unlockRound } = useStore();

  if (!game) return null;

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

  const ranking = [...game.players]
    .map((p) => ({ ...p, total: totals[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const goToRound = (n: number) => nav(`/game/${game.id}/round/${n}/results`);
  const goToBids = (n: number) => nav(`/game/${game.id}/round/${n}/bets`);

  return (
    <Layout
      title="Tableau de bord"
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
        <div className="card p-4">
          <div className="text-lg font-semibold mb-2">Classement actuel</div>
          <ol className="space-y-1">
            {ranking.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between">
                <div>
                  {i + 1}. {p.name}
                </div>
                <div className="font-medium tabular-nums">{p.total}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2">Manche</th>
                  {game.players.map((p) => (
                    <th key={p.id} className="px-2 py-2">
                      {p.name}
                    </th>
                  ))}
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: game.totalRounds }, (_, i) => i + 1).map(
                  (n) => {
                    const r = rounds.find((rr) => rr.roundNumber === n);
                    const locked = r?.locked ?? false;
                    return (
                      <tr
                        key={n}
                        className={n === game.currentRound ? 'bg-accent/10' : ''}
                      >
                        <td
                          className="px-3 py-2 cursor-pointer hover:underline"
                          onClick={() => goToRound(n)}
                          title="Voir/éditer les résultats"
                        >
                          {n}
                        </td>
                        {game.players.map((p) => (
                          <td
                            key={p.id}
                            className="px-2 py-2 cursor-pointer"
                            onClick={() => goToRound(n)}
                            title="Voir/éditer les résultats"
                          >
                            {r?.results[p.id]?.score ?? ''}
                          </td>
                        ))}
                        <td className="px-2 py-2">
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
                <tr className="border-t border-white/10 bg-white/5">
                  <td className="px-3 py-2 font-semibold">Total</td>
                  {game.players.map((p) => (
                    <td key={p.id} className="px-2 py-2 font-semibold">
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