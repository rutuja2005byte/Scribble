# Scribble

A real-time multiplayer Scribble.io-style drawing and guessing game built with React, Vite, Node.js, Express, Socket.IO, and HTML5 Canvas.

## Features

- Username-only entry with in-memory players
- Room creation and room-code joining
- Real-time multiplayer canvas drawing
- Live chat with automatic correct-guess detection
- Scoreboard, timed turns, rounds, and final leaderboard
- Responsive dark UI

## Local Development

```bash
npm install
npm run install:all
npm run dev
```

Client: `http://localhost:5173`  
Server: `http://localhost:4000`

## Production Build

```bash
npm run build
NODE_ENV=production npm start
```

In production, Express serves `client/dist` and Socket.IO connects on the same origin.

## Render Deployment

Use these settings when deploying as one Node service:

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Environment variables:

```bash
NODE_ENV=production
PORT=<provided by Render>
```

Leave `CLIENT_ORIGIN` unset when deploying as a single service. Set `CLIENT_ORIGIN` only if the React frontend is hosted separately from the Socket.IO backend.
