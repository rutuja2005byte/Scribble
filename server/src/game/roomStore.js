import { GAME_CONFIG } from '../constants/gameConfig.js';
import { createRoomCode } from '../utils/codeGenerator.js';
import { getRandomWord, toBlanks } from '../utils/wordUtils.js';

const rooms = new Map();

function publicPlayer(player) {
  return {
    id: player.id,
    username: player.username,
    score: player.score,
    isHost: player.isHost,
    guessed: player.guessed
  };
}

export function getRoom(roomCode) {
  return rooms.get(roomCode);
}

export function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some((player) => player.id === socketId)) {
      return room;
    }
  }

  return null;
}

export function createRoom({ socketId, username }) {
  const roomCode = createRoomCode(rooms);
  const player = {
    id: socketId,
    username,
    score: 0,
    isHost: true,
    guessed: false
  };

  const room = {
    code: roomCode,
    players: [player],
    hostId: socketId,
    status: 'lobby',
    round: 1,
    turnIndex: -1,
    drawerId: null,
    currentWord: '',
    guessedPlayerIds: new Set(),
    timer: GAME_CONFIG.turnSeconds,
    timerId: null,
    previousWord: ''
  };

  rooms.set(roomCode, room);
  return { room, player };
}

export function joinRoom({ roomCode, socketId, username }) {
  const room = rooms.get(String(roomCode || '').toUpperCase());

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

export function removePlayer(socketId) {
  const room = getRoomBySocket(socketId);

  if (!room) {
    return null;
  }

  const removedPlayer = room.players.find((player) => player.id === socketId);
  room.players = room.players.filter((player) => player.id !== socketId);
  room.guessedPlayerIds.delete(socketId);

  if (room.players.length === 0) {
    clearRoomTimer(room);
    rooms.delete(room.code);
    return { room, removedPlayer, deleted: true };
  }

  if (room.hostId === socketId) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  if (room.drawerId === socketId) {
    room.drawerId = null;
  }

  if (room.turnIndex >= room.players.length) {
    room.turnIndex = -1;
  }

  return { room, removedPlayer, deleted: false };
}

export function resetForLobby(room) {
  clearRoomTimer(room);
  room.status = 'lobby';
  room.round = 1;
  room.turnIndex = -1;
  room.drawerId = null;
  room.currentWord = '';
  room.timer = GAME_CONFIG.turnSeconds;
  room.guessedPlayerIds = new Set();
  room.previousWord = '';
  room.players = room.players.map((player, index) => ({
    ...player,
    score: 0,
    guessed: false,
    isHost: index === 0
  }));
  room.hostId = room.players[0]?.id || null;
}

export function startNextTurn(room) {
  clearRoomTimer(room);

  if (room.players.length < GAME_CONFIG.minPlayers) {
    room.status = 'lobby';
    room.drawerId = null;
    room.currentWord = '';
    return { waiting: true };
  }

  const nextIndex = room.turnIndex + 1;

  if (nextIndex >= room.players.length) {
    room.round += 1;
    room.turnIndex = 0;
  } else {
    room.turnIndex = nextIndex;
  }

  if (room.round > GAME_CONFIG.maxRounds) {
    room.status = 'finished';
    room.drawerId = null;
    room.currentWord = '';
    return { gameOver: true };
  }

  room.status = 'playing';
  room.drawerId = room.players[room.turnIndex].id;
  room.currentWord = getRandomWord(room.previousWord);
  room.previousWord = room.currentWord;
  room.timer = GAME_CONFIG.turnSeconds;
  room.guessedPlayerIds = new Set();
  room.players = room.players.map((player) => ({ ...player, guessed: false }));

  return { gameOver: false, waiting: false };
}

export function buildPublicRoom(room) {
  const drawer = room.players.find((player) => player.id === room.drawerId);

  return {
    code: room.code,
    status: room.status,
    round: room.round,
    maxRounds: GAME_CONFIG.maxRounds,
    timer: room.timer,
    hostId: room.hostId,
    drawerId: room.drawerId,
    drawerName: drawer?.username || '',
    wordHint: room.currentWord ? toBlanks(room.currentWord) : '',
    players: room.players.map(publicPlayer).sort((a, b) => b.score - a.score)
  };
}

export function getPrivateWord(room, socketId) {
  return room.drawerId === socketId ? room.currentWord : null;
}

export function clearRoomTimer(room) {
  if (room.timerId) {
    clearInterval(room.timerId);
    room.timerId = null;
  }
}

export function setRoomTimer(room, timerId) {
  room.timerId = timerId;
}
