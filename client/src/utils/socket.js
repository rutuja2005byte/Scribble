import { io } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:4000' : undefined);

export const socket = io(serverUrl, {
  autoConnect: false,
  transports: ['websocket']
});
