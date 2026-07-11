import { AuthRoom } from './components/AuthRoom.jsx';
import { GameRoom } from './components/GameRoom.jsx';
import { useGame } from './context/GameContext.jsx';

export default function App() {
  const { room } = useGame();

  return (
    <main className="app-shell">
      {room ? <GameRoom /> : <AuthRoom />}
    </main>
  );
}
