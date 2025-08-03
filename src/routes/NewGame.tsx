import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import NumberStepper from '../components/NumberStepper';
import { Player } from '../types';
import { uid } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function NewGame() {
  const nav = useNavigate();
  const { createGame } = useStore();
  const [rounds, setRounds] = useState(10);
  const [players, setPlayers] = useState<Player[]>([
    { id: uid(), name: 'Joueur 1' },
    { id: uid(), name: 'Joueur 2' }
  ]);

  const addPlayer = () =>
    setPlayers((ps) => [...ps, { id: uid(), name: `Joueur ${ps.length + 1}` }]);
  const removePlayer = (id: string) =>
    setPlayers((ps) => ps.filter((p) => p.id !== id));
  const updateName = (id: string, name: string) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));

  const canStart = players.length >= 2 && players.length <= 10 && rounds >= 1;

  const start = async () => {
    const gameId = await createGame({
      players,
      totalRounds: rounds,
      scoringPresetId: 'standard'
    });
    nav(`/game/${gameId}/round/1/bets`);
  };

  return (
    <Layout title="Configuration">
      <div className="space-y-6">
        <section className="card p-4">
          <div className="section-title mb-2">Manches</div>
          <NumberStepper value={rounds} min={1} max={20} onChange={setRounds} />
        </section>

        <section className="card p-4">
          <div className="section-title mb-3">Joueurs</div>
          <div className="space-y-2">
            {players.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-6 text-right opacity-70">{idx + 1}.</span>
                <input
                  className="input flex-1"
                  value={p.name}
                  onChange={(e) => updateName(p.id, e.target.value)}
                  placeholder={`Joueur ${idx + 1}`}
                />
                {players.length > 2 && (
                  <button
                    className="btn btn-danger"
                    onClick={() => removePlayer(p.id)}
                  >
                    Retirer
                  </button>
                )}
              </div>
            ))}
          </div>
          {players.length < 10 && (
            <button className="btn btn-ghost mt-3" onClick={addPlayer}>
              Ajouter un joueur
            </button>
          )}
        </section>

        <div className="flex justify-end">
          <button
            disabled={!canStart}
            className="btn btn-primary disabled:opacity-50"
            onClick={start}
          >
            Démarrer la partie
          </button>
        </div>
      </div>
    </Layout>
  );
}