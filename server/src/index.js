import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import healthRoutes from './routes/healthRoutes.js';
import { registerGameSocket } from './sockets/gameSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const port = process.env.PORT || 4000;

app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.use('/api', healthRoutes);

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST']
  }
});

registerGameSocket(io);

server.listen(port, () => {
  console.log(`Scribble server listening on http://localhost:${port}`);
});
