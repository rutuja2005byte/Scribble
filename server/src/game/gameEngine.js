import { GAME_CONFIG } from '../constants/gameConfig.js';
import {
  buildPublicRoom,
  clearRoomTimer,
  getPrivateWord,
  resetForLobby,
  setRoomTimer,
  startNextTurn
} from './roomStore.js';
import { normalizeGuess } from '../utils/wordUtils.js';

export function emitRoomState(io, room) {
  io.to(room.code).emit('room-state', buildPublicRoom(room));

  room.players.forEach((player) => {
    io.to(player.id).emit('choose-word', {
      word: getPrivateWord(room, player.id),
      wordHint: buildPublicRoom(room).wordHint
    });
  });
}

export function beginGame(io, room) {
  room.round = 1;
  room.turnIndex = -1;
  room.players = shufflePlayers(room.players).map((player) => ({
    ...player,
    score: 0,
    guessed: false
  }));

  beginNextTurn(io, room);
}

export function beginNextTurn(io, room) {
  const result = startNextTurn(room);

  if (result.waiting) {
    emitRoomState(io, room);
    io.to(room.code).emit('system-message', {
      text: 'Waiting for another player to continue.'
    });
    return;
  }

  if (result.gameOver) {
    emitGameOver(io, room);
    return;
  }

  io.to(room.code).emit('clear-canvas');
  io.to(room.code).emit('next-turn', buildPublicRoom(room));
  emitRoomState(io, room);
  startTimer(io, room);
}

export function handleGuess(io, room, socketId, message) {
  const player = room.players.find((item) => item.id === socketId);

  if (!player || room.status !== 'playing') {
    return;
  }

  const cleanMessage = String(message || '').trim().slice(0, 180);

  if (!cleanMessage) {
    return;
  }

  if (socketId === room.drawerId || player.guessed) {
    io.to(room.code).emit('chat-message', {
      id: Date.now(),
      playerId: player.id,
      username: player.username,
      message: cleanMessage,
      type: 'chat'
    });
    return;
  }

  if (normalizeGuess(cleanMessage) === normalizeGuess(room.currentWord)) {
    player.score += GAME_CONFIG.guessPoints;
    const drawer = room.players.find((item) => item.id === room.drawerId);

    if (drawer) {
      drawer.score += GAME_CONFIG.drawerPoints;
    }

    player.guessed = true;
    room.guessedPlayerIds.add(player.id);

    io.to(room.code).emit('correct-guess', {
      playerId: player.id,
      username: player.username,
      message: `${player.username} guessed the word!`
    });
    io.to(room.code).emit('update-score', buildPublicRoom(room));
    emitRoomState(io, room);

    const activeGuessers = room.players.filter((item) => item.id !== room.drawerId);
    const allGuessed = activeGuessers.length > 0 && activeGuessers.every((item) => item.guessed);

    if (allGuessed) {
      setTimeout(() => beginNextTurn(io, room), 900);
    }
    return;
  }

  io.to(room.code).emit('chat-message', {
    id: Date.now(),
    playerId: player.id,
    username: player.username,
    message: cleanMessage,
    type: 'chat'
  });
}

export function handlePlayAgain(io, room) {
  resetForLobby(room);
  emitRoomState(io, room);
}

function startTimer(io, room) {
  clearRoomTimer(room);
  io.to(room.code).emit('timer', room.timer);

  const timerId = setInterval(() => {
    room.timer -= 1;
    io.to(room.code).emit('timer', room.timer);

    if (room.timer <= 0) {
      beginNextTurn(io, room);
    }
  }, 1000);

  setRoomTimer(room, timerId);
}

function emitGameOver(io, room) {
  clearRoomTimer(room);
  const leaderboard = buildPublicRoom(room).players;
  const winner = leaderboard[0] || null;

  io.to(room.code).emit('game-over', {
    winner,
    leaderboard,
    room: buildPublicRoom(room)
  });
  emitRoomState(io, room);
}

function shufflePlayers(players) {
  return [...players]
    .map((player) => ({ player, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ player }) => player);
}
