import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import NumberStepper from '../components/NumberStepper';
import { Player } from '../types';
import { uid, shuffleArray } from '../lib/utils';
import { useStore } from '../store/useStore';
import PlayerNameCombobox from '../components/PlayerNameCombobox';

export default function NewGame() {
  const nav = useNavigate();
  const { createGame } = useStore();
  const [rounds, setRounds] = useState(10);
  const [players, setPlayers] = useState<Player[]>([
    { id: uid(), name: 'Player 1' },
    { id: uid(), name: 'Player 2' }
  ]);
  const [playerName, setPlayerName] = useState('');

  const [randomizeOrder, setRandomizeOrder] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<Player[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addPlayer = (name: string = '') => {
    const playerName = name || `Player ${players.length + 1}`;
    // Check for duplicate names before adding
    const isDuplicate = players.some(p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase());
    if (isDuplicate) return;
    
    setPlayers((ps) => [...ps, { id: uid(), name: playerName }]);
    setPlayerName('');
  };
  const removePlayer = (id: string) =>
    setPlayers((ps) => ps.filter((p) => p.id !== id));
  const updateName = (id: string, name: string) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));

  const canStart = players.length >= 2 && players.length <= 10 && rounds >= 1;

  const start = async () => {
    if (!randomizeOrder) {
      // If randomizeOrder is false, start the game immediately with current players
      const gameId = await createGame({
        players,
        totalRounds: rounds,
        scoringPresetId: 'standard'
      });
      nav(`/game/${gameId}/round/1/bets`);
    } else {
      // If randomizeOrder is true, shuffle the players array
      const shuffledPlayers = shuffleArray(players);
      setPreviewOrder(shuffledPlayers);
      setShowPreview(true);
    }
  };

  const toggleRandomizeOrder = () => {
    setRandomizeOrder(prev => !prev);
  };

  const handlePreviewOrder = () => {
    if (!randomizeOrder) return;
    const shuffled = shuffleArray(players);
    setPreviewOrder(shuffled);
    setShowPreview(true);
  };

  const confirmPreviewOrder = async () => {
    if (!previewOrder) return;
    try {
      const gameId = await createGame({
        players: previewOrder,
        totalRounds: rounds,
        scoringPresetId: 'standard'
      });
      nav(`/game/${gameId}/round/1/bets`);
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('An error occurred while creating the game. Please try again.');
    }
  };

  const cancelPreviewOrder = () => {
    setShowPreview(false);
    // Keep players array unchanged in form
    // User can click Start again to generate new random order
  };

  const hidePreview = () => {
    setShowPreview(false);
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
                <div className="flex-1">
                  <PlayerNameCombobox
                    value={p.name}
                    onChange={(name) => updateName(p.id, name)}
                    placeholder={`Player ${idx + 1}`}
                    currentGamePlayers={players}
                  />
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => removePlayer(p.id)}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
          {players.length < 10 && (
            <button className="btn btn-ghost mt-3" onClick={() => addPlayer()}>
              Ajouter un joueur
            </button>
          )}
        </section>

        <section className="card p-4">
          <div className="section-title mb-2">Ordre de jeu</div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={randomizeOrder}
                onChange={toggleRandomizeOrder}
                className="rounded"
              />
              <span>Ordre Random</span>
            </label>
            <button
              className="btn btn-secondary ml-auto"
              onClick={handlePreviewOrder}
              disabled={!randomizeOrder}
            >
              Prévoir
            </button>
 
            {showPreview && previewOrder && (
              <section className="card p-4 bg-blue-50 border border-blue-200">
                <div className="section-title mb-2">Prévision d'ordre</div>
                <div className="space-y-1">
                  {previewOrder.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-right opacity-70">{idx + 1}.</span>
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="btn btn-primary"
                    onClick={confirmPreviewOrder}
                  >
                    Confirmer
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={cancelPreviewOrder}
                  >
                    Annuler
                  </button>
                </div>
              </section>
            )}
          </div>
        </section>

        {showPreview && previewOrder && (
          <section className="card p-4 bg-blue-50 border border-blue-200">
            <div className="section-title mb-2">Prévision d'ordre</div>
            <div className="space-y-1">
              {previewOrder.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-right opacity-70">{idx + 1}.</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-ghost mt-2 text-xs"
              onClick={hidePreview}
            >
              Fermer
            </button>
          </section>
        )}

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