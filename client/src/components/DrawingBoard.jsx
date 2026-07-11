import { Eraser, Paintbrush, RotateCcw } from 'lucide-react';
import { useCanvas } from '../hooks/useCanvas.js';
import { useGame } from '../context/GameContext.jsx';

const COLORS = ['#111827', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];

export function DrawingBoard() {
  const { socket, room, player, word, clearCanvas, sendStroke } = useGame();
  const canDraw = room?.drawerId === player?.id && room?.status === 'playing';
  const {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    clear,
    beginDrawing,
    moveDrawing,
    endDrawing
  } = useCanvas({ socket, canDraw, sendStroke });

  const clearBoard = () => {
    if (!canDraw) {
      return;
    }
    clear();
    clearCanvas();
  };

  return (
    <section className="canvas-column">
      <div className="word-strip">
        <span>{canDraw ? 'Your word' : `${room?.drawerName || 'Someone'} is drawing`}</span>
        <strong>{canDraw ? word : room?.wordHint || 'Waiting for game'}</strong>
      </div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className={canDraw ? 'drawing-canvas active' : 'drawing-canvas'}
          onMouseDown={beginDrawing}
          onMouseMove={moveDrawing}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={beginDrawing}
          onTouchMove={moveDrawing}
          onTouchEnd={endDrawing}
        />
        {!canDraw && room?.status === 'playing' && <div className="canvas-lock">Guess the word in chat</div>}
        {room?.status === 'lobby' && <div className="canvas-lock">Waiting in lobby</div>}
      </div>

      <div className="tool-bar">
        <button className={tool === 'brush' ? 'icon-button selected' : 'icon-button'} onClick={() => setTool('brush')} title="Brush" disabled={!canDraw}>
          <Paintbrush size={18} />
        </button>
        <button className={tool === 'eraser' ? 'icon-button selected' : 'icon-button'} onClick={() => setTool('eraser')} title="Eraser" disabled={!canDraw}>
          <Eraser size={18} />
        </button>
        <div className="swatches">
          {COLORS.map((item) => (
            <button
              key={item}
              className={color === item && tool === 'brush' ? 'swatch selected' : 'swatch'}
              style={{ backgroundColor: item }}
              onClick={() => {
                setColor(item);
                setTool('brush');
              }}
              disabled={!canDraw}
              title={item}
            />
          ))}
        </div>
        <input type="range" min="2" max="26" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} disabled={!canDraw} />
        <button className="icon-button" onClick={clearBoard} title="Clear canvas" disabled={!canDraw}>
          <RotateCcw size={18} />
        </button>
      </div>
    </section>
  );
}
