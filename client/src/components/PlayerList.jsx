import { Crown, Palette } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

export function PlayerList() {
  const { room } = useGame();

  return (
    <div className="panel players-panel">
      <div className="panel-header">
        <h2>Players</h2>
        <span>{room?.players?.length || 0}</span>
      </div>
      <div className="player-list">
        {room?.players?.map((item, index) => (
          <div className="player-row" key={item.id}>
            <div className="rank">{index + 1}</div>
            <div>
              <div className="player-name">
                {item.username}
                {item.isHost && <Crown size={14} className="gold" />}
                {room.drawerId === item.id && <Palette size={14} className="cyan" />}
              </div>
              <div className="player-state">{item.guessed ? 'Guessed' : room.drawerId === item.id ? 'Drawing' : 'Guessing'}</div>
            </div>
            <strong>{item.score}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
