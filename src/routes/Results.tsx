import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import NumberStepper from '../components/NumberStepper';
import DualCardCounter from '../components/DualCardCounter';
import CardCounter from '../components/CardCounter';
import { presets } from '../config/scoringConfig';
import { calculateScore } from '../lib/score';
import { Round } from '../types';
import { useStore } from '../store/useStore';
import { uid } from '../lib/utils';

export default function Results() {
  const { gameId, roundNumber } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { upsertRound, setCurrentRound, completeGame, unlockRound } =
    useStore();

  const rNum = Number(roundNumber || 1);
  
  // If the game hasn't hydrated yet, keep showing a loading state instead of erroring.
  if (!game) {
    return <Layout title="Chargement">Chargement…</Layout>;
  }

  const round = useMemo<Round | undefined>(
    () => rounds.find((r) => r.roundNumber === rNum),
    [rounds, rNum]
  );

  // Build an effective round model: use existing round if present, otherwise
  // construct an empty default so the UI can render inputs for first-time visits.
  const effectiveRound: Round = useMemo(
    () =>
      round ?? {
        id: uid(),
        gameId: game.id,
        roundNumber: rNum,
        bids: {},
        results: {},
        locked: false
      },
    [round, game.id, rNum]
  );
// Debug logs to validate round loading behavior
if ((import.meta as any).env?.DEV) {
  // eslint-disable-next-line no-console
  console.debug('[Results] render', {
    gameId: game.id,
    rNum,
    foundExistingRound: !!round,
    effectiveRoundId: effectiveRound.id,
    isLocked: !!effectiveRound.locked
  });
}

  const config = presets.standard;
  const isLocked = !!effectiveRound.locked;

  const [local, setLocal] = useState<Record<string, any>>(() => {
    const o: Record<string, any> = {};
    for (const p of game.players) {
      const existing = effectiveRound.results[p.id];
      const bid = effectiveRound.bids[p.id]?.bid ?? 0;
      const adj = effectiveRound.bids[p.id]?.betAdjustedByHarry ?? 0;
      const specials = existing?.specialCards;
      const isNumber = typeof specials === 'number';
      const specialsValue = isNumber
        ? { positive: specials, negative: 0 }
        : { ...(specials ?? {}) };
      o[p.id] = {
        tricks: existing?.tricks ?? 0,
        bonus: existing?.bonus ?? 0,
        harry: adj ?? 0,
        // Default all special card counters to 0 when results are missing
        specials: {
          skullKing: specials?.skullKing ?? { positive: 0, negative: 0 },
          second: specials?.second ?? { positive: 0, negative: 0 },
          pirates: specials?.pirates ?? { positive: 0, negative: 0 },
          mermaids: specials?.mermaids ?? { positive: 0, negative: 0 },
          coins: specials?.coins ?? { positive: 0, negative: 0 },
          beasts: specials?.beasts ?? { positive: 0, negative: 0 },
          rascalGamble: specials?.rascalGamble ?? { positive: 0, negative: 0 },
          punishment: specials?.punishment ?? { negative: 0 }
        },
        bid
      };
    }
    return o;
  });

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const p of game.players) {
      // Default to collapsed (hidden) for all players
      o[p.id] = true;
    }
    return o;
  });

  const setPlayer = (pid: string, key: string, value: any) =>
    setLocal((s) => ({ ...s, [pid]: { ...s[pid], [key]: value } }));

  const saveRound = async () => {
    // Start from the effective round (existing or defaulted)
    const updated: Round = { ...effectiveRound };
    for (const p of game.players) {
      const pid = p.id;
      const entry = local[pid];
      const adjustedBid =
        entry.bid + (config.allowHarryAdjustment ? entry.harry ?? 0 : 0);
      const score = calculateScore(
        adjustedBid,
        entry.tricks,
        rNum,
        entry.bonus,
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
      <div className="space-y-4">
        {isLocked && (
          <div className="card p-3 flex items-center justify-between">
            <div className="text-sm opacity-80">
              Manche verrouillée. Déverrouillez pour modifier les résultats.
            </div>
            <button
              className="btn btn-ghost"
              onClick={async () => {
                await unlockRound(game.id, rNum);
              }}
            >
              Déverrouiller
            </button>
          </div>
        )}

        <div className="card p-3 flex items-center justify-between">
          <div className="text-sm opacity-80">
            Besoin d’ajuster les paris de cette manche ?
          </div>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              if (isLocked) await unlockRound(game.id, rNum);
              nav(`/game/${game.id}/round/${rNum}/bets`);
            }}
          >
            Modifier les paris
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-2">
        {game.players.map((p) => {
          const entry = local[p.id];
          const adjustedBid =
            entry.bid + (config.allowHarryAdjustment ? entry.harry ?? 0 : 0);
          const projected = calculateScore(
            adjustedBid,
            entry.tricks,
            rNum,
            entry.bonus,
            config
          );

          return (
            <div key={p.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">{p.name}</h4>
                <div className="opacity-80">
                  Pari: {entry.bid}{' '}
                  {entry.harry
                    ? `(Harry ${entry.harry > 0 ? '+' : ''}${entry.harry})`
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
                      className="btn btn-ghost"
                      onClick={() => {
                        const newValue = Math.max(-2, entry.harry - 1);
                        setPlayer(p.id, 'harry', newValue);
                      }}
                    >
                      −1
                    </button>
                    <span className="w-12 text-center tabular-nums font-semibold">
                      {entry.harry}
                    </span>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        const newValue = Math.min(2, entry.harry + 1);
                        setPlayer(p.id, 'harry', newValue);
                      }}
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
                <div
                  className="section-title flex items-center justify-between cursor-pointer p-2 rounded-lg bg-surface/30 hover:bg-surface/50 transition-colors"
                  onClick={() => {
                    setCollapsedSections(prev => ({
                      ...prev,
                      [p.id]: !prev[p.id]
                    }));
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{collapsedSections[p.id] ? '▶' : '▼'}</span>
                    <span>Cartes spéciales</span>
                  </div>
                  <span className="text-sm opacity-75">Cliquez pour {collapsedSections[p.id] ? 'ouvrir' : 'fermer'}</span>
                </div>
                {!collapsedSections[p.id] && (
                  <div className="grid grid-cols-1 gap-2 p-2">
                    <DualCardCounter
                      icon="💀👑"
                      label="Skull King"
                      value={{
                        positive: entry.specials?.skullKing?.positive ?? 0,
                        negative: entry.specials?.skullKing?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', {
                          ...entry.specials,
                          skullKing: v
                        })
                      }
                    />
                    <DualCardCounter
                      icon="🦜"
                      label="Second"
                      value={{
                        positive: entry.specials?.second?.positive ?? 0,
                        negative: entry.specials?.second?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', {
                          ...entry.specials,
                          second: v
                        })
                      }
                    />
                    <DualCardCounter
                      icon="🏴‍☠️"
                      label="Pirate"
                      value={{
                        positive: entry.specials?.pirates?.positive ?? 0,
                        negative: entry.specials?.pirates?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', {
                          ...entry.specials,
                          pirates: v
                        })
                      }
                    />
                    <DualCardCounter
                      icon="🧜‍♀️"
                      label="Sirène"
                      value={{
                        positive: entry.specials?.mermaids?.positive ?? 0,
                        negative: entry.specials?.mermaids?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', {
                          ...entry.specials,
                          mermaids: v
                        })
                      }
                    />
                    <DualCardCounter
                      icon="🪙"
                      label="Pièce"
                      value={{
                        positive: entry.specials?.coins?.positive ?? 0,
                        negative: entry.specials?.coins?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, coins: v })
                      }
                    />
                    <DualCardCounter
                      icon="🦑"
                      label="Monstre"
                      value={{
                        positive: entry.specials?.beasts?.positive ?? 0,
                        negative: entry.specials?.beasts?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, beasts: v })
                      }
                    />
                    <DualCardCounter
                      icon="🎰"
                      label="rascalGamble"
                      value={{
                        positive: entry.specials?.rascalGamble?.positive ?? 0,
                        negative: entry.specials?.rascalGamble?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, rascalGamble: v })
                      }
                    />
                    <DualCardCounter
                      icon="🚩"
                      label="Punition"
                      value={{
                        positive: entry.specials?.punishment?.positive ?? 0,
                        negative: entry.specials?.punishment?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, punishment: v })
                      }
                    />
                  </div>
                )}
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

