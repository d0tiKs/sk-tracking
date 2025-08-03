import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';

export default function Dashboard() {
  const { gameId } = useParams();
  const { game, rounds } = useGame(gameId);

  if (!game) return null;

  const totals: Record<string, number> = {};
  for (const p of game.players) totals[p.id] = 0;
  for (const r of rounds) {
    for (const [pid, res] of Object.entries(r.results)) {
      totals[pid] += res.score ?? 0;
    }
  }

  return (
    <Layout title="Tableau de bord">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Manche</th>
              {game.players.map((p) => (
                <th key={p.id} className="px-2">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: game.totalRounds }, (_, i) => i + 1).map((n) => {
              const r = rounds.find((rr) => rr.roundNumber === n);
              return (
                <tr key={n} className={n === game.currentRound ? 'bg-accent/20' : ''}>
                  <td className="px-2 py-1">{n}</td>
                  {game.players.map((p) => (
                    <td key={p.id} className="px-2 py-1">
                      {r?.results[p.id]?.score ?? ''}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-t border-accent/40">
              <td className="px-2 py-1 font-semibold">Total</td>
              {game.players.map((p) => (
                <td key={p.id} className="px-2 py-1 font-semibold">
                  {totals[p.id]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Link className="px-3 py-2 rounded bg-surface" to={`/game/${game.id}/round/${game.currentRound}/bets`}>
          Retour
        </Link>
      </div>
    </Layout>
  );
}