import { Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

export function EndGameModal() {
  const { gameOver, playAgain, room, player } = useGame();
  const isHost = room?.hostId === player?.id;

  return (
    <div className="modal-backdrop">
      <div className="end-modal">
        <Trophy size={38} className="gold" />
        <h2>{gameOver?.winner?.username || 'Nobody'} wins!</h2>
        <div className="final-list">
          {gameOver?.leaderboard?.map((item, index) => (
            <div key={item.id}>
              <span>{index + 1}. {item.username}</span>
              <strong>{item.score}</strong>
            </div>
          ))}
        </div>
        {isHost ? (
          <button className="primary-button" onClick={playAgain}>Play Again</button>
        ) : (
          <p className="muted">Waiting for host to restart.</p>
        )}
      </div>
    </div>
  );
}
