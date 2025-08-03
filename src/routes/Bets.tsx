import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useGame } from '../hooks/useGame';
import NumberStepper from '../components/NumberStepper';
import { useEffect, useMemo, useState } from 'react';
import { Round } from '../types';
import { uid } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function Bets() {
  const { gameId, roundNumber } = useParams();
  const nav = useNavigate();
  const { game, rounds } = useGame(gameId);
  const { upsertRound } = useStore();
  const rNum = Number(roundNumber);

  const round = useMemo<Round | undefined>(
    () => rounds.find((r) => r.roundNumber === rNum),
    [rounds, rNum]
  );
  const [bids, setBids] = useState<Record<string, number>>({});

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

  const maxBid = rNum;
  const totalTricks = rNum;

  const saveAndNext = async () => {
    const newRound: Round =
      round ?? {
        id: uid(),
        gameId: game.id,
        roundNumber: rNum,
        bids: {},
        results: {},
        locked: false
      };
    for (const p of game.players) {
      newRound.bids[p.id] = {
        playerId: p.id,
        bid: Math.max(0, Math.min(maxBid, Math.trunc(bids[p.id] ?? 0))),
        betAdjustedByHarry: newRound.bids[p.id]?.betAdjustedByHarry ?? 0
      };
      newRound.results[p.id] = newRound.results[p.id] ?? {
        tricks: 0,
        bonus: 0,
        specialCards: {},
        score: 0
      };
    }
    await upsertRound(newRound);
    nav(`/game/${game.id}/round/${rNum}/results`);
  };

  const sumBids = Object.values(bids).reduce((a, b) => a + b, 0);

  return (
    <Layout
      title={`Manche ${rNum} · Paris`}
      right={
        <Link className="btn btn-ghost" to={`/game/${game.id}/dashboard`}>
          Tableau
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="badge badge-ok">Plis: {totalTricks}</span>
          <span
            className={`badge ${
              sumBids === totalTricks ? 'badge-ok' : 'badge-bad'
            }`}
          >
            Total paris: {sumBids}
          </span>
        </div>

        <ul className="space-y-3">
          {game.players.map((p) => (
            <li
              key={p.id}
              className="card p-4 flex items-center justify-between"
            >
              <span className="font-medium">{p.name}</span>
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