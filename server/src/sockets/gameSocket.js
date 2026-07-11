import { GAME_CONFIG } from '../constants/gameConfig.js';
import {
  buildPublicRoom,
  createRoom,
  getRoom,
  getRoomBySocket,
  removePlayer
} from '../game/roomStore.js';
import {
  beginGame,
  beginNextTurn,
  emitRoomState,
  handleGuess,
  handlePlayAgain
} from '../game/gameEngine.js';

export function registerGameSocket(io) {
  io.on('connection', (socket) => {
    socket.on('create-room', ({ username }, callback) => {
      const cleanName = sanitizeUsername(username);

      if (!cleanName) {
        callback?.({ ok: false, error: 'Enter a username.' });
        return;
      }

      const { room, player } = createRoom({ socketId: socket.id, username: cleanName });
      socket.join(room.code);
      callback?.({ ok: true, room: buildPublicRoom(room), player });
      emitRoomState(io, room);
    });

    socket.on('join-room', ({ roomCode, username }, callback) => {
      const cleanName = sanitizeUsername(username);

      if (!cleanName) {
        callback?.({ ok: false, error: 'Enter a username.' });
        return;
      }

      const result = joinExistingRoom(roomCode, socket.id, cleanName);

      if (result.error) {
        callback?.({ ok: false, error: result.error });
        return;
      }

      socket.join(result.room.code);
      callback?.({ ok: true, room: buildPublicRoom(result.room), player: result.player });
      socket.to(result.room.code).emit('player-joined', {
        username: result.player.username
      });
      emitRoomState(io, result.room);
    });

    socket.on('start-game', ({ roomCode }, callback) => {
      const room = getRoom(roomCode);

      if (!room) {
        callback?.({ ok: false, error: 'Room not found.' });
        return;
      }

      if (room.hostId !== socket.id) {
        callback?.({ ok: false, error: 'Only the host can start the game.' });
        return;
      }

      if (room.players.length < GAME_CONFIG.minPlayers) {
        callback?.({ ok: false, error: 'At least 2 players are required.' });
        return;
      }

      callback?.({ ok: true });
      io.to(room.code).emit('start-game', buildPublicRoom(room));
      beginGame(io, room);
    });

    socket.on('draw', ({ roomCode, stroke }) => {
      const room = getRoom(roomCode);

      if (!room || room.drawerId !== socket.id || room.status !== 'playing') {
        return;
      }

      socket.to(room.code).emit('draw', stroke);
    });

    socket.on('clear-canvas', ({ roomCode }) => {
      const room = getRoom(roomCode);

      if (!room || room.drawerId !== socket.id || room.status !== 'playing') {
        return;
      }

      io.to(room.code).emit('clear-canvas');
    });

    socket.on('chat-message', ({ roomCode, message }) => {
      const room = getRoom(roomCode);

      if (!room) {
        return;
      }

      handleGuess(io, room, socket.id, message);
    });

    socket.on('play-again', ({ roomCode }) => {
      const room = getRoom(roomCode);

      if (!room || room.hostId !== socket.id) {
        return;
      }

      io.to(room.code).emit('play-again');
      handlePlayAgain(io, room);
    });

    socket.on('disconnect', () => {
      const result = removePlayer(socket.id);

      if (!result || result.deleted) {
        return;
      }

      const { room, removedPlayer } = result;
      io.to(room.code).emit('player-left', {
        playerId: removedPlayer.id,
        username: removedPlayer.username
      });
      emitRoomState(io, room);

      if (room.status === 'playing' && !room.drawerId) {
        beginNextTurn(io, room);
      }
    });
  });
}

function joinExistingRoom(roomCode, socketId, username) {
  const normalizedCode = String(roomCode || '').trim().toUpperCase();
  const room = getRoom(normalizedCode);

  if (!room) {
    return { error: 'Room not found.' };
  }

  if (room.status !== 'lobby') {
    return { error: 'This game is already in progress.' };
  }

  const player = {
    id: socketId,
    username,
    score: 0,
    isHost: false,
    guessed: false
  };

  room.players.push(player);
  return { room, player };
}

function sanitizeUsername(username) {
  return String(username || '').trim().slice(0, 18);
}
