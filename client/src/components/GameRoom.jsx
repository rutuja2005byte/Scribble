import { ChatPanel } from './ChatPanel.jsx';
import { DrawingBoard } from './DrawingBoard.jsx';
import { EndGameModal } from './EndGameModal.jsx';
import { PlayerList } from './PlayerList.jsx';
import { TopBar } from './TopBar.jsx';
import { useGame } from '../context/GameContext.jsx';

export function GameRoom() {
  const { room, gameOver } = useGame();

  return (
    <section className="game-layout">
      <TopBar />
      <aside className="left-panel">
        <PlayerList />
      </aside>
      <DrawingBoard />
      <aside className="right-panel">
        <ChatPanel />
      </aside>
      {room?.status === 'finished' && gameOver && <EndGameModal />}
    </section>
  );
}
