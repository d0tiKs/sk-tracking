import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './routes/Home';
import NewGame from './routes/NewGame';
import Bets from './routes/Bets';
import Results from './routes/Results';
import Summary from './routes/Summary';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<NewGame />} />
      <Route
        path="/game/:gameId/round/:roundNumber/bets"
        element={<Bets />}
      />
      <Route
        path="/game/:gameId/round/:roundNumber/results"
        element={<Results />}
      />
      <Route path="/game/:gameId/summary" element={<Summary />} />
      {/* back-compat redirects */}
      <Route
        path="/game/:gameId/dashboard"
        element={<Summary />}
      />
      <Route
        path="/game/:gameId/final"
        element={<Summary />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}