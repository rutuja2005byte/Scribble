import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext.jsx';

export function ChatPanel() {
  const { messages, sendMessage, room, player } = useGame();
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const canChat = Boolean(room?.code);
  const isDrawer = room?.drawerId === player?.id && room?.status === 'playing';

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }
    sendMessage(text);
    setText('');
  };

  return (
    <div className="panel chat-panel">
      <div className="panel-header">
        <h2>Chat</h2>
        <span>{isDrawer ? 'Draw' : 'Guess'}</span>
      </div>
      <div className="messages" ref={listRef}>
        {messages.map((item, index) => (
          <div className={`message ${item.type || 'chat'}`} key={`${item.id || index}-${item.username || 'system'}`}>
            {item.type === 'chat' && <strong>{item.username}</strong>}
            <span>{item.message || item.text}</span>
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder={isDrawer ? 'Chat with the room' : 'Type a guess'} disabled={!canChat} />
        <button type="submit" title="Send" disabled={!canChat}>
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
