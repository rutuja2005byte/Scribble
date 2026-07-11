import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { socket } from '../utils/socket';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [word, setWord] = useState(null);
  const [timer, setTimer] = useState(80);
  const [messages, setMessages] = useState([]);
  const [gameOver, setGameOver] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.connect();

    socket.on('room-state', (nextRoom) => {
      setRoom(nextRoom);
      setTimer(nextRoom.timer);
    });
    socket.on('choose-word', ({ word: privateWord }) => setWord(privateWord));
    socket.on('timer', setTimer);
    socket.on('next-turn', () => {
      setMessages([]);
      setGameOver(null);
    });
    socket.on('chat-message', (message) => {
      setMessages((items) => [...items, message].slice(-80));
    });
    socket.on('correct-guess', (message) => {
      setMessages((items) => [...items, { ...message, type: 'correct' }].slice(-80));
    });
    socket.on('system-message', (message) => {
      setMessages((items) => [...items, { ...message, type: 'system' }].slice(-80));
    });
    socket.on('player-joined', ({ username }) => {
      setMessages((items) => [...items, { text: `${username} joined.`, type: 'system' }].slice(-80));
    });
    socket.on('player-left', ({ username }) => {
      setMessages((items) => [...items, { text: `${username} left.`, type: 'system' }].slice(-80));
    });
    socket.on('game-over', (payload) => {
      setGameOver(payload);
      setRoom(payload.room);
    });
    socket.on('play-again', () => {
      setGameOver(null);
      setMessages([]);
      setWord(null);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  const request = useCallback((event, payload) => (
    new Promise((resolve) => {
      socket.emit(event, payload, (response) => {
        if (!response?.ok) {
          setError(response?.error || 'Something went wrong.');
          resolve(response);
          return;
        }

        setError('');
        if (response.player) {
          setPlayer(response.player);
        }
        if (response.room) {
          setRoom(response.room);
        }
        resolve(response);
      });
    })
  ), []);

  const createRoom = useCallback((username) => request('create-room', { username }), [request]);
  const joinRoom = useCallback((username, roomCode) => request('join-room', { username, roomCode }), [request]);
  const startGame = useCallback(() => request('start-game', { roomCode: room?.code }), [request, room?.code]);
  const sendMessage = useCallback((message) => socket.emit('chat-message', { roomCode: room?.code, message }), [room?.code]);
  const playAgain = useCallback(() => socket.emit('play-again', { roomCode: room?.code }), [room?.code]);
  const clearCanvas = useCallback(() => socket.emit('clear-canvas', { roomCode: room?.code }), [room?.code]);
  const sendStroke = useCallback((stroke) => socket.emit('draw', { roomCode: room?.code, stroke }), [room?.code]);

  const value = useMemo(() => ({
    socket,
    player,
    room,
    word,
    timer,
    messages,
    gameOver,
    error,
    createRoom,
    joinRoom,
    startGame,
    sendMessage,
    playAgain,
    clearCanvas,
    sendStroke,
    setError
  }), [player, room, word, timer, messages, gameOver, error, createRoom, joinRoom, startGame, sendMessage, playAgain, clearCanvas, sendStroke]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
