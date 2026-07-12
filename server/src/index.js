import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import healthRoutes from './routes/healthRoutes.js';
import { registerGameSocket } from './sockets/gameSocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || (isProduction ? undefined : 'http://localhost:5173');
const port = process.env.PORT || 4000;

if (clientOrigin) {
  app.use(cors({ origin: clientOrigin }));
}

app.use(express.json());
app.use('/api', healthRoutes);

const socketOptions = clientOrigin
  ? {
    cors: {
      origin: clientOrigin,
      methods: ['GET', 'POST']
    }
  }
  : {};

const io = new Server(server, socketOptions);

registerGameSocket(io);

if (isProduction) {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`Scribble server listening on http://localhost:${port}`);
});
