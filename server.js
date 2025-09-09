const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for sessions (in production, use a database)
const sessions = new Map();
const characters = new Map();

// Session management
class GameSession {
  constructor(id, name, gmId) {
    this.id = id;
    this.name = name;
    this.gmId = gmId;
    this.players = new Map();
    this.characters = new Map();
    this.createdAt = new Date();
    this.status = 'waiting'; // waiting, active, paused, ended
    this.settings = {
      allowSpectators: true,
      maxPlayers: 6,
      diceRolls: 'public' // public, gm-only, private
    };
  }

  addPlayer(playerId, playerName, characterData = null) {
    if (this.players.size >= this.settings.maxPlayers) {
      throw new Error('Session is full');
    }

    const player = {
      id: playerId,
      name: playerName,
      character: characterData,
      joinedAt: new Date(),
      isGM: playerId === this.gmId
    };

    this.players.set(playerId, player);
    
    if (characterData) {
      this.characters.set(playerId, characterData);
    }

    return player;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.characters.delete(playerId);
  }

  updateCharacter(playerId, characterData) {
    if (this.characters.has(playerId)) {
      this.characters.set(playerId, characterData);
      return true;
    }
    return false;
  }

  getSessionData() {
    return {
      id: this.id,
      name: this.name,
      gmId: this.gmId,
      players: Array.from(this.players.values()),
      characters: Array.from(this.characters.entries()),
      status: this.status,
      settings: this.settings,
      createdAt: this.createdAt
    };
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).map(session => ({
    id: session.id,
    name: session.name,
    playerCount: session.players.size,
    maxPlayers: session.settings.maxPlayers,
    status: session.status,
    createdAt: session.createdAt
  }));
  res.json(sessionList);
});

app.post('/api/sessions', (req, res) => {
  const { name, gmName } = req.body;
  const sessionId = require('uuid').v4();
  
  const session = new GameSession(sessionId, name, sessionId); // GM ID same as session ID for now
  sessions.set(sessionId, session);
  
  // Add GM as first player
  session.addPlayer(sessionId, gmName);
  
  res.json({
    sessionId,
    message: 'Session created successfully'
  });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session.getSessionData());
});

app.post('/api/sessions/:id/join', (req, res) => {
  const { playerName, characterData } = req.body;
  const session = sessions.get(req.params.id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (session.status !== 'waiting') {
    return res.status(400).json({ error: 'Session is not accepting new players' });
  }
  
  try {
    const playerId = require('uuid').v4();
    const player = session.addPlayer(playerId, playerName, characterData);
    
    // Notify all players about new player
    io.to(req.params.id).emit('playerJoined', {
      playerId,
      playerName,
      characterData
    });
    
    res.json({
      playerId,
      message: 'Joined session successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
    
    // Send current session state to the new player
    const session = sessions.get(sessionId);
    if (session) {
      socket.emit('sessionState', session.getSessionData());
    }
  });
  
  socket.on('updateCharacter', (data) => {
    const { sessionId, playerId, characterData } = data;
    const session = sessions.get(sessionId);
    
    if (session && session.updateCharacter(playerId, characterData)) {
      // Broadcast character update to all players in session
      io.to(sessionId).emit('characterUpdated', {
        playerId,
        characterData
      });
    }
  });
  
  socket.on('diceRoll', (data) => {
    const { sessionId, playerId, rollType, dice, modifier, result } = data;
    
    // Broadcast dice roll to all players in session
    io.to(sessionId).emit('diceRolled', {
      playerId,
      rollType,
      dice,
      modifier,
      result,
      timestamp: new Date()
    });
  });
  
  socket.on('chatMessage', (data) => {
    const { sessionId, playerId, message, playerName } = data;
    
    // Broadcast chat message to all players in session
    io.to(sessionId).emit('chatMessage', {
      playerId,
      playerName,
      message,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
