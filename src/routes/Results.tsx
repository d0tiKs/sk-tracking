import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import NumberStepper from '../components/NumberStepper';
import DualCardCounter from '../components/DualCardCounter';
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


  console.debug('[Results] params', { gameId, roundNumber });
  console.debug('[Results] game hydrating?', !!game);
  // If the game hasn't hydrated yet, keep showing a loading state instead of erroring.
  if (!game) {
    nav(`/game/${gameId}/round/${rNum}/reulsts`, { replace: true });
  }

  const round = useMemo<Round | undefined>(
    () => rounds.find((r) => r.roundNumber === rNum),
    [rounds, rNum]
  );

  // Build an effective round model safely until hydration: tolerate undefined.
  const effectiveRound = useMemo<Round | undefined>(() => {
    if (!game) return undefined;
    return (
      round ?? {
        id: uid(),
        gameId: game.id,
        roundNumber: rNum,
        bids: {},
        results: {},
        locked: false
      }
    );
  }, [round, game?.id, rNum]);

  // Redirect only on reload and only if page would be blank (no game or no effectiveRound)
  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const isReload = navEntry?.type === 'reload';
    //if (!isReload) return;
    if ((!game || !effectiveRound) && gameId) {
      nav(`/game/${gameId}/round/${rNum}/bets`, { replace: true });
      return;
    }
  }, [game, effectiveRound, gameId, rNum, nav]);

  const config = presets.standard;
  const isLocked = !!effectiveRound?.locked;

  // Initialize with safe empty defaults; populate via effects once hydrated.
  const [local, setLocal] = useState<Record<string, any>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Populate local state when game and effectiveRound are ready
  useEffect(() => {
    if ((!game || !effectiveRound)) {
      nav(`/game/${gameId}/round/${rNum}/bets`, { replace: true });
      return;
    }
    console.debug('[Results] initializing local/collapsed for game', game?.id, 'round', rNum);
    const o: Record<string, any> = {};
    for (const p of game.players) {
      const existing = effectiveRound.results[p.id];
      const bid = effectiveRound.bids[p.id]?.bid ?? 0;
      const adj = effectiveRound.bids[p.id]?.betAdjustedByHarry ?? 0;
      const specials = existing?.specialCards ?? {};
      o[p.id] = {
        tricks: existing?.tricks ?? 0,
        bonus: existing?.bonus ?? 0,
        harry: adj ?? 0,
        specials: {
          skullKing: specials?.skullKing ?? { positive: 0, negative: 0 },
          second: specials?.second ?? { positive: 0, negative: 0 },
          pirates: specials?.pirates ?? { positive: 0, negative: 0 },
          mermaids: specials?.mermaids ?? { positive: 0, negative: 0 },
          babyPirates: specials?.babyPirates ?? { positive: 0, negative: 0 },
          coins: specials?.coins ?? { positive: 0, negative: 0 },
          beasts: specials?.beasts ?? { positive: 0, negative: 0 },
          rascalGamble: specials?.rascalGamble ?? { positive: 0, negative: 0 },
          punishment: specials?.punishment ?? { negative: 0 }
        },
        bid
      };
    }
    setLocal(o);
  }, [game, effectiveRound]);

  // Initialize collapsed sections for the current game's players
  useEffect(() => {
    if (!game) return;
    console.debug('[Results] initializing local/collapsed for game', gameId, 'round', rNum);
    const o: Record<string, boolean> = {};
    for (const p of game.players) {
      o[p.id] = true; // default collapsed
    }
    setCollapsedSections(o);
  }, [gameId]);

  const setPlayer = (pid: string, key: string, value: any) =>
    setLocal((s) => ({ ...s, [pid]: { ...s[pid], [key]: value } }));

  const saveRound = async () => {
    if (!game) return;
    const baseRound: Round =
      effectiveRound ?? {
        id: uid(),
        gameId: game.id,
        roundNumber: rNum,
        bids: {},
        results: {},
        locked: false
      };
    const updated: Round = { ...baseRound };
    for (const p of game.players) {
      const pid = p.id;
      const entry = local[pid] ?? {
        tricks: 0,
        bonus: 0,
        harry: 0,
        specials: {
          skullKing: { positive: 0, negative: 0 },
          second: { positive: 0, negative: 0 },
          pirates: { positive: 0, negative: 0 },
          mermaids: { positive: 0, negative: 0 },
          babyPirates: { positive: 0, negative: 0 },
          coins: { positive: 0, negative: 0 },
          beasts: { positive: 0, negative: 0 },
          rascalGamble: { positive: 0, negative: 0 },
          punishment: { negative: 0 }
        },
        bid: effectiveRound?.bids?.[p.id]?.bid ?? 0
      };
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
          <button
            className="btn btn-ghost"
            onClick={async () => {
              if (isLocked) await unlockRound(game.id, rNum);
              nav(`/game/${game.id}/round/${rNum}/bets`);
            }}
          >
            Retour aux paris
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-2">
        {game.players.map((p) => {
          const entry = local[p.id] ?? {
            tricks: 0,
            bonus: 0,
            harry: 0,
            specials: {
              skullKing: { positive: 0, negative: 0 },
              second: { positive: 0, negative: 0 },
              pirates: { positive: 0, negative: 0 },
              mermaids: { positive: 0, negative: 0 },
              babyPirates: { positive: 0, negative: 0 },
              coins: { positive: 0, negative: 0 },
              beasts: { positive: 0, negative: 0 },
              rascalGamble: { positive: 0, negative: 0 },
              punishment: { negative: 0 }
            },
            bid: effectiveRound?.bids?.[p.id]?.bid ?? 0
          };
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
            <div key={p.id} className="card p-3 space-y-3">
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
                  <span>Harry The Giant</span>
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
                  <span>Bonus</span>
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
                  <div className="grid grid-cols-2 gap-2 p-1">
                    {/* 💀👑 Skull King */}
                    <DualCardCounter
                      icon="👑"
                      label=""
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
                    {/* 🦜 Second */}
                    <DualCardCounter
                      icon="🦜"
                      label=""
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
                    {/* 🏴‍☠️ Pirates */}
                    <DualCardCounter
                      icon="🏴‍☠️"
                      label=""
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
                    {/* 🧜‍♀️ Mermaids */}
                    <DualCardCounter
                      icon="🧜‍♀️"
                      label=""
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
                    {/* 👶 Baby Pirate */}
                    <DualCardCounter
                      icon="👶"
                      label=""
                      value={{
                        positive: entry.specials?.babyPirates?.positive ?? 0,
                        negative: entry.specials?.babyPirates?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', {
                          ...entry.specials,
                          babyPirates: v
                        })
                      }
                    />
                    {/* 🪙 Coins */}
                    <DualCardCounter
                      icon="🪙"
                      label=""
                      value={{
                        positive: entry.specials?.coins?.positive ?? 0,
                        negative: entry.specials?.coins?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, coins: v })
                      }
                    />
                    {/* 🦑 Beasts */}
                    <DualCardCounter
                      icon="🦑"
                      label=""
                      value={{
                        positive: entry.specials?.beasts?.positive ?? 0,
                        negative: entry.specials?.beasts?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, beasts: v })
                      }
                    />
                    {/* 🎰 Rascal Gamble */}
                    <DualCardCounter
                      icon="🎰"
                      label=""
                      value={{
                        positive: entry.specials?.rascalGamble?.positive ?? 0,
                        negative: entry.specials?.rascalGamble?.negative ?? 0
                      }}
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', { ...entry.specials, rascalGamble: v })
                      }
                    />
                    {/* 🚩 Punishment (negative only) */}
                    <DualCardCounter
                      icon="🚩"
                      label=""
                      value={{
                        positive: 0,
                        negative: entry.specials?.punishment?.negative ?? 0
                      }}
                      disablePositive
                      onChange={(v) =>
                        setPlayer(p.id, 'specials', {
                          ...entry.specials,
                          punishment: { negative: v.negative ?? 0 }
                        })
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

