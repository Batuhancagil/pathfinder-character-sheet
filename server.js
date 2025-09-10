const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Database imports
const { initializeDatabase, query } = require('./database/connection');
const { User, Session, Player, Character, DiceRoll, ChatMessage } = require('./database/models');

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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = User.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

// Initialize database on startup
async function startServer() {
    try {
        console.log('Starting server...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        
        await initializeDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        console.log('Continuing without database...');
    }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'Connected' : 'Not connected'
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('Registration attempt:', { name, email, password: password ? '***' : 'missing' });
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      provider: 'email'
    });
    
    console.log('User created successfully:', user.id);
    
    // Generate token
    const token = User.generateToken(user);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture_url
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user',
      details: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = User.generateToken(user);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture_url
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { id, name, email, picture, provider } = req.body;
    
    // Check if user exists
    let user = await User.findByGoogleId(id);
    
    if (!user) {
      // Check if user exists with this email
      user = await User.findByEmail(email);
      if (user) {
        // Update existing user with Google ID
        await query(
          'UPDATE users SET google_id = $1, picture_url = $2, provider = $3 WHERE id = $4',
          [id, picture, provider, user.id]
        );
        user.google_id = id;
        user.picture_url = picture;
        user.provider = provider;
      } else {
        // Create new user
        user = await User.create({
          googleId: id,
          name,
          email,
          pictureUrl: picture,
          provider
        });
      }
    }
    
    // Generate token
    const token = User.generateToken(user);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture_url
      },
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// API Routes
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.findAll();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { name, gmName } = req.body;
    
    // Create session
    const session = await Session.create(name, uuidv4(), {
      allowSpectators: true,
      maxPlayers: 6,
      diceRolls: 'public'
    });
    
    // Create GM player
    const gmPlayer = await Player.create(session.id, gmName, true);
    
    res.json({
      sessionId: session.id,
      playerId: gmPlayer.id,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const players = await Player.findBySession(req.params.id);
    const characters = await Character.findBySession(req.params.id);
    
    res.json({
      ...session,
      players: players,
      characters: characters
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

app.post('/api/sessions/:id/join', async (req, res) => {
  try {
    const { playerName, characterData } = req.body;
    const sessionId = req.params.id;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status !== 'waiting') {
      return res.status(400).json({ error: 'Session is not accepting new players' });
    }
    
    // Check player count
    const players = await Player.findBySession(sessionId);
    const maxPlayers = session.settings.maxPlayers || 6;
    if (players.length >= maxPlayers) {
      return res.status(400).json({ error: 'Session is full' });
    }
    
    // Create player
    const player = await Player.create(sessionId, playerName, false);
    
    // Create character if provided
    if (characterData) {
      await Character.create(player.id, sessionId, characterData);
    }
    
    // Notify all players about new player
    io.to(sessionId).emit('playerJoined', {
      playerId: player.id,
      playerName: player.name,
      characterData: characterData
    });
    
    res.json({
      playerId: player.id,
      message: 'Joined session successfully'
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// Characters API
app.get('/api/characters', authenticateToken, async (req, res) => {
  try {
    const characters = await Character.findByUser(req.user.id);
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

app.post('/api/characters', authenticateToken, async (req, res) => {
  try {
    const { characterData } = req.body;
    
    const character = await Character.create(req.user.id, null, null, characterData);
    res.json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinSession', async (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
    
    // Send current session state to the new player
    try {
      const session = await Session.findById(sessionId);
      if (session) {
        const players = await Player.findBySession(sessionId);
        const characters = await Character.findBySession(sessionId);
        
        socket.emit('sessionState', {
          ...session,
          players: players,
          characters: characters
        });
      }
    } catch (error) {
      console.error('Error fetching session state:', error);
    }
  });
  
  socket.on('updateCharacter', async (data) => {
    try {
      const { sessionId, playerId, characterData } = data;
      
      // Update character in database
      await Character.update(playerId, characterData);
      
      // Broadcast character update to all players in session
      io.to(sessionId).emit('characterUpdated', {
        playerId,
        characterData
      });
    } catch (error) {
      console.error('Error updating character:', error);
    }
  });
  
  socket.on('diceRoll', async (data) => {
    try {
      const { sessionId, playerId, rollType, dice, modifier, result, diceExpression } = data;
      
      // Save dice roll to database
      await DiceRoll.create(sessionId, playerId, rollType, diceExpression || `${dice}+${modifier}`, result, {
        dice: dice,
        modifier: modifier
      });
      
      // Broadcast dice roll to all players in session
      io.to(sessionId).emit('diceRolled', {
        playerId,
        rollType,
        dice,
        modifier,
        result,
        diceExpression,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving dice roll:', error);
    }
  });
  
  socket.on('chatMessage', async (data) => {
    try {
      const { sessionId, playerId, message, playerName } = data;
      
      // Save chat message to database
      await ChatMessage.create(sessionId, playerId, message);
      
      // Broadcast chat message to all players in session
      io.to(sessionId).emit('chatMessage', {
        playerId,
        playerName,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
startServer().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
  });
});
