import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import { useMemo, useState } from 'react';
import NumberStepper from '../components/NumberStepper';
import CardCounter from '../components/CardCounter';
import { presets } from '../config/scoringConfig';
import { computeBonusFromSpecials, calculateScore } from '../lib/score';
import { Round } from '../types';
import { useStore } from '../store/useStore';

export default function Results() {
  const { gameId, roundNumber } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { upsertRound, setCurrentRound, completeGame } = useStore();
  const rNum = Number(roundNumber);
  const config = presets.standard;

  const round = useMemo<Round | undefined>(
    () => rounds.find((r) => r.roundNumber === rNum),
    [rounds, rNum]
  );

  const [local, setLocal] = useState(() => {
    if (!game) return {};
    const o: any = {};
    for (const p of game.players) {
      const existing = round?.results[p.id];
      const bid = round?.bids[p.id]?.bid ?? 0;
      const adj = round?.bids[p.id]?.betAdjustedByHarry ?? 0;
      o[p.id] = {
        tricks: existing?.tricks ?? 0,
        bonus: existing?.bonus ?? 0,
        harry: adj as -1 | 0 | 1,
        specials: { ...(existing?.specialCards ?? {}) },
        bid
      };
    }
    return o;
  });

  if (!game) return null;
  if (!round) return <Layout title="Erreur">Round introuvable</Layout>;

  const setPlayer = (pid: string, key: string, value: any) =>
    setLocal((s: any) => ({ ...s, [pid]: { ...s[pid], [key]: value } }));

  const saveRound = async () => {
    const updated: Round = { ...round };
    for (const p of game.players) {
      const pid = p.id;
      const entry = (local as any)[pid];
      const specialsBonus = computeBonusFromSpecials(entry.specials, config);
      const adjustedBid =
        entry.bid + (config.allowHarryAdjustment ? entry.harry ?? 0 : 0);
      const score = calculateScore(
        adjustedBid,
        entry.tricks,
        rNum,
        entry.bonus + specialsBonus,
        config
      );

      updated.bids[pid] = {
        playerId: pid,
        bid: entry.bid,
        betAdjustedByHarry: entry.harry ?? 0
      };
      updated.results[pid] = {
        tricks: entry.tricks,
        bonus: entry.bonus,
        specialCards: entry.specials,
        score
      };
    }
    updated.locked = true;
    await upsertRound(updated);

    if (rNum < game.totalRounds) {
      await setCurrentRound(rNum + 1);
      nav(`/game/${game.id}/round/${rNum + 1}/bets`);
    } else {
      await completeGame(game.id);
      nav(`/game/${game.id}/final`);
    }
  };

  return (
    <Layout title={`Résultats · Manche ${rNum}`}>
      <div className="space-y-6">
        {game.players.map((p) => {
          const entry = (local as any)[p.id];
          const specialsBonus = computeBonusFromSpecials(entry.specials, config);
          const adjustedBid =
            entry.bid + (config.allowHarryAdjustment ? entry.harry ?? 0 : 0);
          const projected = calculateScore(
            adjustedBid,
            entry.tricks,
            rNum,
            entry.bonus + specialsBonus,
            config
          );

          return (
            <div key={p.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">{p.name}</h4>
                <div className="opacity-80">
                  Pari: {entry.bid}{' '}
                  {entry.harry
                    ? `(Harry ${entry.harry > 0 ? '+1' : '-1'})`
                    : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <span>Plis réalisés</span>
                  <NumberStepper
                    value={entry.tricks}
                    min={0}
                    max={rNum}
                    onChange={(v) => setPlayer(p.id, 'tricks', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Harry The Giant (ajustement pari)</span>
                  <div className="flex items-center gap-2">
                    <button
                      className={`btn btn-ghost ${
                        entry.harry === -1 ? 'ring-2 ring-accent/50' : ''
                      }`}
                      onClick={() => setPlayer(p.id, 'harry', -1)}
                    >
                      −1
                    </button>
                    <button
                      className={`btn btn-ghost ${
                        entry.harry === 0 ? 'ring-2 ring-accent/50' : ''
                      }`}
                      onClick={() => setPlayer(p.id, 'harry', 0)}
                    >
                      0
                    </button>
                    <button
                      className={`btn btn-ghost ${
                        entry.harry === 1 ? 'ring-2 ring-accent/50' : ''
                      }`}
                      onClick={() => setPlayer(p.id, 'harry', 1)}
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Bonus (+10 / -10)</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-ghost"
                      onClick={() => setPlayer(p.id, 'bonus', entry.bonus - 10)}
                    >
                      −10
                    </button>
                    <span className="w-12 text-center tabular-nums">
                      {entry.bonus}
                    </span>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setPlayer(p.id, 'bonus', entry.bonus + 10)}
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="section-title">Cartes spéciales</div>
                <div className="grid grid-cols-1 gap-2">
                  <CardCounter
                    icon="💀👑"
                    label="Skull King"
                    value={entry.specials.skullKing ?? 0}
                    onChange={(v) =>
                      setPlayer(p.id, 'specials', {
                        ...entry.specials,
                        skullKing: v
                      })
                    }
                  />
                  <CardCounter
                    icon="🏴‍☠️"
                    label="Pirate"
                    value={entry.specials.pirates ?? 0}
                    onChange={(v) =>
                      setPlayer(p.id, 'specials', {
                        ...entry.specials,
                        pirates: v
                      })
                    }
                  />
                  <CardCounter
                    icon="🧜‍♀️"
                    label="Sirène"
                    value={entry.specials.mermaids ?? 0}
                    onChange={(v) =>
                      setPlayer(p.id, 'specials', {
                        ...entry.specials,
                        mermaids: v
                      })
                    }
                  />
                  <CardCounter
                    icon="🪙"
                    label="Pièce"
                    value={entry.specials.coins ?? 0}
                    onChange={(v) =>
                      setPlayer(p.id, 'specials', { ...entry.specials, coins: v })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="opacity-80">Score projeté</span>
                <span
                  className={
                    projected >= 0
                      ? 'text-green-400 font-semibold'
                      : 'text-red-400 font-semibold'
                  }
                >
                  {projected >= 0 ? `+${projected}` : projected}
                </span>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={saveRound}>
            Valider la manche
          </button>
        </div>
      </div>
    </Layout>
  );
}