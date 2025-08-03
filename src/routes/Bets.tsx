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

  const round = useMemo<Round | undefined>(() => rounds.find((r) => r.roundNumber === rNum), [rounds, rNum]);
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

  const maxBid = rNum; // standard: up to round number
  const totalTricks = rNum;

  const saveAndNext = async () => {
    const newRound: Round = round ?? {
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
    <Layout title={`Manche ${rNum}: Paris`}>
      <div className="space-y-4">
        <div className="opacity-80">Plis possibles: {totalTricks}</div>
        <ul className="space-y-3">
          {game.players.map((p) => (
            <li key={p.id} className="p-3 rounded bg-surface flex items-center justify-between">
              <span>{p.name}</span>
              <NumberStepper
                value={bids[p.id] ?? 0}
                min={0}
                max={maxBid}
                onChange={(v) => setBids((b) => ({ ...b, [p.id]: v }))}
              />
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between">
          <span>Total des paris: {sumBids}</span>
          <div className="flex gap-2">
            <Link className="px-3 py-2 rounded bg-surface" to={`/game/${game.id}/dashboard`}>Tableau</Link>
            <button className="px-4 py-2 rounded bg-accent" onClick={saveAndNext}>Valider</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}