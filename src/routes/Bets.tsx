import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useGame } from "../hooks/useGame";
import NumberStepper from "../components/NumberStepper";
import { Round } from "../types";
import { uid } from "../lib/utils";
import { useStore } from "../store/useStore";

export default function Bets() {
  const { gameId, roundNumber } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { upsertRound, unlockRound } = useStore();
  const rNum = Number(roundNumber);

  const round = useMemo(
    () => rounds.find((r) => r.roundNumber === rNum),
    [rounds, rNum],
  ) as Round | undefined;

  const [bids, setBids] = useState<Record<string, number>>({});
  const [showStandings, setShowStandings] = useState(false); // Collapsible toggle

  useEffect(() => {
    if (round && game) {
      const initial: Record<string, number> = {};
      for (const p of game.players) {
        initial[p.id] = round.bids[p.id]?.bid ?? 0;
      }
      setBids(initial);
    } else if (game) {
      const initial: Record<string, number> = {};
      for (const p of game.players) initial[p.id] = 0;
      setBids(initial);
    }
  }, [round, game]);

  if (!game) return null;

  const isLocked = !!round?.locked;
  const maxBid = rNum + 1;
  const totalTricks = rNum;
  const firstPlayerIndex = (rNum - 1) % game.players.length;
  const firstPlayer = game.players[firstPlayerIndex];

  // --- Compute current totals for standings ---
  const totals: Record<string, number> = {};
  for (const p of game.players) totals[p.id] = 0;
  for (const r of rounds) {
    for (const [pid, res] of Object.entries(r.results) as [
      string,
      { score?: number },
    ][]) {
      totals[pid] += res?.score ?? 0;
    }
  }

  const ranking = [...game.players]
    .map((p) => ({ ...p, total: totals[p.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const rankIcon = (i: number) =>
    i === 0 ? "👑" : i === 1 ? "🏴‍☠️" : i === 2 ? "🧜‍♀️" : i === 3 ? "👶" : "";

  const saveAndNext = async () => {
    const newRound: Round = round ?? {
      id: uid(),
      gameId: game.id,
      roundNumber: rNum,
      bids: {},
      results: {},
      locked: false,
    };
    for (const p of game.players) {
      newRound.bids[p.id] = {
        playerId: p.id,
        bid: Math.max(0, Math.min(maxBid, Math.trunc(bids[p.id] ?? 0))),
        betAdjustedByHarry: newRound.bids[p.id]?.betAdjustedByHarry ?? 0,
      };
      newRound.results[p.id] = newRound.results[p.id] ?? {
        tricks: 0,
        bonus: 0,
        specialCards: {
          skullKing: { positive: 0, negative: 0 },
          second: { positive: 0, negative: 0 },
          pirates: { positive: 0, negative: 0 },
          mermaids: { positive: 0, negative: 0 },
          coins: { positive: 0, negative: 0 },
          escapes: 0,
        },
        score: 0,
      };
    }
    await upsertRound(newRound);
    nav(`/game/${game.id}/round/${rNum}/results`);
  };

  const sumBids = (Object.values(bids) as number[]).reduce((a, b) => a + b, 0);

  const isCompleted = game.status === "completed";

  return (
    <Layout
      title={`Manche ${rNum} · Paris`}
      right={
        <Link className="btn btn-ghost" to={`/game/${game.id}/dashboard`}>
          Détails
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Collapsible standings card - same style as Summary */}
        <div className="card p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowStandings((s) => !s)}
          >
            <div className="text-lg font-semibold">Classement actuel</div>
            <span className="text-sm opacity-75">
              {showStandings ? "▼" : "▶"}
            </span>
          </div>

          {showStandings && (
            <>
              <ol className="space-y-1 mt-2">
                {ranking.map((p, i) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span>
                      {i + 1}. <span className="ml-1">{rankIcon(i)}</span>{" "}
                      {p.name}
                    </span>
                    <span className="font-medium tabular-nums">{p.total}</span>
                  </li>
                ))}
              </ol>

              {isCompleted ? (
                <div className="mt-4 text-sm opacity-80">Partie terminée</div>
              ) : (
                <div className="mt-3 text-sm opacity-80">
                  Partie en cours — Manche {game.currentRound}/
                  {game.totalRounds}
                </div>
              )}
            </>
          )}
        </div>

        {isLocked && (
          <div className="card p-3 flex items-center justify-between">
            <div className="text-sm opacity-80">
              Manche verrouillée. Déverrouillez pour modifier les paris.
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

        <div className="flex items-center gap-3">
          <span className="badge badge-ok">Plis: {totalTricks}</span>
          <span
            className={`badge ${
              sumBids === totalTricks ? "badge-ok" : "badge-bad"
            }`}
          >
            Total paris: {sumBids}
          </span>
          <span className="badge">{firstPlayer?.name} commence.</span>
        </div>

        <ul
          className={`space-y-3 ${
            isLocked ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {game.players.map((p, i) => (
            <li
              key={p.id}
              className={`card p-4 flex items-center justify-between ${
                i === firstPlayerIndex ? "ring-2 ring-primary" : ""
              }`}
            >
              <span className="font-medium">
                {p.name}
                {i === firstPlayerIndex && (
                  <span className="ml-2 text-sm opacity-70">· 1er</span>
                )}
              </span>
              <NumberStepper
                value={bids[p.id] ?? 0}
                min={0}
                max={maxBid}
                onChange={(v) => setBids((b) => ({ ...b, [p.id]: v }))}
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-2">
          <button className="btn btn-primary" onClick={saveAndNext}>
            Valider les paris
          </button>
        </div>
      </div>
    </Layout>
  );
}
