import { Clock, Copy, Crown, Play } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

export function TopBar() {
  const { room, player, timer, startGame, error } = useGame();
  const isHost = room?.hostId === player?.id;

  return (
    <header className="top-bar">
      <div className="room-chip" title="Room code">
        <Copy size={16} />
        {room?.code}
      </div>
      <div className="round-status">
        <span>Round {Math.min(room?.round || 1, room?.maxRounds || 3)}/{room?.maxRounds || 3}</span>
        <span className="timer"><Clock size={17} /> {timer}s</span>
      </div>
      <div className="host-actions">
        {room?.status === 'lobby' && isHost && (
          <button className="primary-button" onClick={startGame} disabled={(room?.players?.length || 0) < 2}>
            <Play size={17} />
            Start
          </button>
        )}
        {room?.status === 'lobby' && !isHost && <span className="muted"><Crown size={15} /> Waiting for host</span>}
        {error && <span className="error-inline">{error}</span>}
      </div>
    </header>
  );
}
