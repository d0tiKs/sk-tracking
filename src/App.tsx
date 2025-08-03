import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './routes/Home';
import NewGame from './routes/NewGame';
import Bets from './routes/Bets';
import Results from './routes/Results';
import Final from './routes/Final';
import Dashboard from './routes/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<NewGame />} />
      <Route path="/game/:gameId/round/:roundNumber/bets" element={<Bets />} />
      <Route path="/game/:gameId/round/:roundNumber/results" element={<Results />} />
      <Route path="/game/:gameId/final" element={<Final />} />
      <Route path="/game/:gameId/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}