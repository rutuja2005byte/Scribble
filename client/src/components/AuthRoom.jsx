import { useState } from 'react';
import { LogIn, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

export function AuthRoom() {
  const { createRoom, joinRoom, error, setError } = useGame();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const submitCreate = async (event) => {
    event.preventDefault();
    await createRoom(username);
  };

  const submitJoin = async (event) => {
    event.preventDefault();
    if (!roomCode.trim()) {
      setError('Enter a room code.');
      return;
    }
    await joinRoom(username, roomCode);
  };

  return (
    <section className="entry-screen">
      <div className="entry-panel">
        <div>
          <p className="eyebrow">Real-time drawing party</p>
          <h1>Scribble</h1>
          <p className="entry-copy">Create a room, share the code, and race through three fast rounds of guesses.</p>
        </div>

        <label>
          Username
          <input value={username} maxLength="18" onChange={(event) => setUsername(event.target.value)} placeholder="Your name" />
        </label>

        <div className="entry-actions">
          <form onSubmit={submitCreate}>
            <button className="primary-button" type="submit">
              <Plus size={18} />
              Create Room
            </button>
          </form>
          <form className="join-form" onSubmit={submitJoin}>
            <input value={roomCode} maxLength="5" onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="CODE" />
            <button type="submit" title="Join room">
              <LogIn size={18} />
            </button>
          </form>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
}
