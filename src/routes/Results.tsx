import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import { useMemo, useState } from 'react';
import NumberStepper from '../components/NumberStepper';
import CardCounter from '../components/CardCounter';
import { presets } from '../config/scoringConfig';
import { computeBonusFromSpecials, calculateScore } from '../lib/score';
import { Round } from '../types';
import { uid } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function Results() {
  const { gameId, roundNumber } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { upsertRound, setCurrentRound, completeGame } = useStore();
  const rNum = Number(roundNumber);
  const config = presets.standard;

  const round = useMemo<Round | undefined>(() => rounds.find((r) => r.roundNumber === rNum), [rounds, rNum]);

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
      const adjustedBid = entry.bid + (config.allowHarryAdjustment ? entry.harry ?? 0 : 0);
      const score = calculateScore(adjustedBid, entry.tricks, rNum, entry.bonus + specialsBonus, config);

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
    <Layout title={`Résultats manche ${rNum}`}>
      <div className="space-y-6">
        {game.players.map((p) => {
          const entry = (local as any)[p.id];
          const specialsBonus = computeBonusFromSpecials(entry.specials, config);
          const adjustedBid = entry.bid + (config.allowHarryAdjustment ? entry.harry ?? 0 : 0);
          const projected = calculateScore(adjustedBid, entry.tricks, rNum, entry.bonus + specialsBonus, config);

          return (
            <div key={p.id} className="rounded bg-surface p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{p.name}</h4>
                <div className="opacity-70">Pari: {entry.bid} {entry.harry ? `(Harry ${entry.harry > 0 ? '+1' : '-1'})` : ''}</div>
              </div>

              <div className="flex items-center justify-between">
                <span>Plis réalisés</span>
                <NumberStepper value={entry.tricks} min={0} max={rNum} onChange={(v) => setPlayer(p.id, 'tricks', v)} />
              </div>

              <div className="flex items-center justify-between">
                <span>Harry The Giant (ajustement pari)</span>
                <div className="flex items-center gap-2">
                  <button className={`px-3 py-1 rounded ${entry.harry === -1 ? 'bg-accent' : 'bg-surface'}`} onClick={() => setPlayer(p.id, 'harry', -1)}>-1</button>
                  <button className={`px-3 py-1 rounded ${entry.harry === 0 ? 'bg-accent' : 'bg-surface'}`} onClick={() => setPlayer(p.id, 'harry', 0)}>0</button>
                  <button className={`px-3 py-1 rounded ${entry.harry === 1 ? 'bg-accent' : 'bg-surface'}`} onClick={() => setPlayer(p.id, 'harry', 1)}>+1</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Bonus (+10 / -10)</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded bg-surface" onClick={() => setPlayer(p.id, 'bonus', entry.bonus - 10)}>-10</button>
                  <span>{entry.bonus}</span>
                  <button className="px-3 py-1 rounded bg-surface" onClick={() => setPlayer(p.id, 'bonus', entry.bonus + 10)}>+10</button>
                </div>
              </div>

              <div className="space-y-2">
                <CardCounter
                  icon="💀👑"
                  label="Skull King"
                  value={entry.specials.skullKing ?? 0}
                  onChange={(v) =>
                    setPlayer(p.id, 'specials', { ...entry.specials, skullKing: v })
                  }
                />
                <CardCounter
                  icon="🏴‍☠️"
                  label="Pirate"
                  value={entry.specials.pirates ?? 0}
                  onChange={(v) =>
                    setPlayer(p.id, 'specials', { ...entry.specials, pirates: v })
                  }
                />
                <CardCounter
                  icon="🧜‍♀️"
                  label="Sirène"
                  value={entry.specials.mermaids ?? 0}
                  onChange={(v) =>
                    setPlayer(p.id, 'specials', { ...entry.specials, mermaids: v })
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

              <div className="flex items-center justify-between pt-2 border-t border-accent/40">
                <span>Score projeté</span>
                <span className={projected >= 0 ? 'text-green-400' : 'text-red-400'}>{projected}</span>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end">
          <button className="px-4 py-2 rounded bg-accent" onClick={saveRound}>Valider la manche</button>
        </div>
      </div>
    </Layout>
  );
}