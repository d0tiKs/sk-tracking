import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Home() {
  const nav = useNavigate();
  const { games, loadGames, deleteGame } = useStore();

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return (
    <Layout
      title="Accueil"
      right={
        <Link to="/new" className="btn btn-primary">
          Nouvelle partie
        </Link>
      }
    >
      <div className="space-y-4">
        {games.length === 0 && (
          <div className="card p-6 text-center">
            <div className="text-xl font-semibold mb-2">Bienvenue</div>
            <p className="opacity-80 mb-4">
              Lancez une nouvelle partie de Skull King.
            </p>
            <Link to="/new" className="btn btn-primary">
              Démarrer
            </Link>
          </div>
        )}

        <ul className="space-y-3">
          {games.map((g) => (
            <li key={g.id} className="card p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">
                  {g.players.map((p) => p.name).join(' • ')}
                </div>
                <div className="text-sm opacity-70 mt-1">
                  {g.status === 'completed' ? 'Terminé' : 'En cours'} • Manche{' '}
                  {g.currentRound}/{g.totalRounds}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (g.status === 'completed') nav(`/game/${g.id}/final`);
                    else nav(`/game/${g.id}/round/${g.currentRound}/bets`);
                  }}
                >
                  Ouvrir
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (confirm('Supprimer la partie ?')) deleteGame(g.id);
                  }}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}