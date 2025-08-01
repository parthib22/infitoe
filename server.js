// Import necessary modules for creating a custom server with Socket.io
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

// Server configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000; // Render provides PORT env variable

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// SOCKET.IO CONCEPT #1: Server-side Game State Storage
// We store all game rooms in memory on the server
// Each room contains the complete game state that gets synchronized to all players
const gameRooms = new Map(); // Map<roomId, GameRoom>

// SOCKET.IO CONCEPT #2: Game Room Class
// This class manages the complete state of a single game room
// It handles all game logic server-side to prevent cheating
class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    
    // MULTIPLAYER CONCEPT: Player Management
    // We track each player with their socket ID and game symbol
    this.players = new Map(); // playerId -> { socketId, symbol, isReady }
    
    // GAME STATE: All the game data that needs to be synchronized
    this.board = Array(9).fill('');      // The 3x3 game board
    this.xIsNext = true;                 // Whose turn it is
    this.queueX = [];                    // X player's pieces on board (max 3)
    this.queueO = [];                    // O player's pieces on board (max 3)
    this.winner = null;                  // Game winner
    this.limit = 3;                      // Max pieces per player
    this.gameStarted = false;            // Whether game is in progress
  }

  // MULTIPLAYER CONCEPT: Adding players to a room
  // Returns false if room is full (max 2 players)
  addPlayer(playerId, socketId) {
    if (this.players.size >= 2) return false;
    
    // First player gets X, second gets O
    const symbol = this.players.size === 0 ? 'x' : 'o';
    this.players.set(playerId, { 
      socketId, 
      symbol, 
      isReady: false  // Players must manually ready up
    });
    return symbol;
  }

  // MULTIPLAYER CONCEPT: Removing players (when they disconnect)
  removePlayer(playerId) {
    this.players.delete(playerId);
    // If no players left, reset the room
    if (this.players.size === 0) {
      this.reset();
    }
  }

  // MULTIPLAYER CONCEPT: Ready system
  // Both players must be ready before game starts
  setPlayerReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (player) {
      player.isReady = ready;
      // Game starts when both players are ready
      this.gameStarted = this.players.size === 2 && 
        Array.from(this.players.values()).every(p => p.isReady);
    }
  }

  // GAME LOGIC: Server-side move validation and processing
  // This is critical - all game logic runs on server to prevent cheating
  makeMove(playerId, index) {
    const player = this.players.get(playerId);
    if (!player || !this.gameStarted || this.winner) return false;

    // TURN VALIDATION: Check if it's the player's turn
    const isPlayerX = player.symbol === 'x';
    if (isPlayerX !== this.xIsNext) return false;

    // BOARD VALIDATION: Check if cell is already occupied
    if (this.board[index]) return false;

    // GAME MECHANICS: Your original infinite tic-tac-toe logic
    const queue = isPlayerX ? this.queueX : this.queueO;
    const nextBoard = [...this.board];
    const nextQueue = [...queue];

    // Place the move on the board
    nextBoard[index] = player.symbol;
    nextQueue.push(index);

    // Check for win BEFORE applying the 3-piece limit
    const potentialWinner = this.calculateWinner(nextBoard);
    if (potentialWinner === player.symbol) {
      this.board = nextBoard;
      if (isPlayerX) this.queueX = nextQueue;
      else this.queueO = nextQueue;
      this.winner = potentialWinner;
      this.xIsNext = !this.xIsNext;
      return true;
    }

    // INFINITE TIC-TAC-TOE RULE: Remove oldest piece if player has 4 pieces
    if (nextQueue.length > this.limit) {
      const removed = nextQueue.shift();
      nextBoard[removed] = '';
    }

    // Update the game state
    this.board = nextBoard;
    if (isPlayerX) this.queueX = nextQueue;
    else this.queueO = nextQueue;
    this.xIsNext = !this.xIsNext;
    
    return true;
  }

  // GAME RESET: Clear all game state
  reset() {
    this.board = Array(9).fill('');
    this.xIsNext = true;
    this.queueX = [];
    this.queueO = [];
    this.winner = null;
    this.gameStarted = false;
    // Reset ready status for both players
    this.players.forEach(player => {
      player.isReady = false;
    });
  }

  // WIN DETECTION: Same logic as your original game
  calculateWinner(squares) {
    const WIN_COMBINATIONS = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const combo of WIN_COMBINATIONS) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

  // SOCKET.IO CONCEPT: State serialization
  // This method packages all game state to send to clients
  getGameState() {
    return {
      board: this.board,
      xIsNext: this.xIsNext,
      queueX: this.queueX,
      queueO: this.queueO,
      winner: this.winner,
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id,
        symbol: player.symbol,
        isReady: player.isReady
      })),
      gameStarted: this.gameStarted
    };
  }
}

// SOCKET.IO CONCEPT #3: Starting the server
app.prepare().then(() => {
  // Create HTTP server that will handle both Next.js and Socket.io
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // SOCKET.IO SETUP: Attach Socket.io to the HTTP server
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ["https://infitoe.onrender.com"] // Replace with your actual Render URL
        : "*",        // Allow all origins in development
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // SOCKET.IO CONCEPT #4: Connection Event
  // This fires every time a user connects to the server
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // SOCKET.IO CONCEPT #5: Custom Events
    // We define custom events that clients can emit to the server

    // EVENT: create-room
    // Client requests to create a new game room
    socket.on('create-room', (callback) => {
      // Generate a random 6-character room ID
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room = new GameRoom(roomId);
      gameRooms.set(roomId, room);
      
      // SOCKET.IO CONCEPT #6: Callbacks
      // Send response back to the client who requested room creation
      callback({ success: true, roomId });
    });

    // EVENT: join-room
    // Client wants to join an existing room
    socket.on('join-room', ({ roomId, playerId }, callback) => {
      const room = gameRooms.get(roomId);
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      const symbol = room.addPlayer(playerId, socket.id);
      if (!symbol) {
        callback({ success: false, error: 'Room is full' });
        return;
      }

      // SOCKET.IO CONCEPT #7: Rooms
      // Join this socket to a Socket.io room for targeted messaging
      socket.join(roomId);
      socket.roomId = roomId;      // Store room ID on socket for later use
      socket.playerId = playerId;  // Store player ID on socket

      // Send success response with game state
      callback({ success: true, symbol, gameState: room.getGameState() });
      
      // SOCKET.IO CONCEPT #8: Broadcasting to a room
      // Notify other players in the room that someone joined
      socket.to(roomId).emit('player-joined', room.getGameState());
    });

    // EVENT: player-ready
    // Player toggles their ready status
    socket.on('player-ready', ({ ready }) => {
      if (!socket.roomId || !socket.playerId) return;
      
      const room = gameRooms.get(socket.roomId);
      if (!room) return;

      room.setPlayerReady(socket.playerId, ready);
      
      // SOCKET.IO CONCEPT #9: Broadcasting to all clients in a room
      // Send updated game state to ALL players in the room (including sender)
      io.to(socket.roomId).emit('game-state-update', room.getGameState());
    });

    // EVENT: make-move
    // Player attempts to make a move
    socket.on('make-move', ({ index }, callback) => {
      if (!socket.roomId || !socket.playerId) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const room = gameRooms.get(socket.roomId);
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      // Process the move on the server
      const success = room.makeMove(socket.playerId, index);
      if (success) {
        // Confirm to the player who made the move
        callback({ success: true });
        // Broadcast new game state to all players in the room
        io.to(socket.roomId).emit('game-state-update', room.getGameState());
      } else {
        callback({ success: false, error: 'Invalid move' });
      }
    });

    // EVENT: reset-game
    // Player wants to reset the game
    socket.on('reset-game', () => {
      if (!socket.roomId) return;
      
      const room = gameRooms.get(socket.roomId);
      if (!room) return;

      room.reset();
      // Broadcast reset state to all players
      io.to(socket.roomId).emit('game-state-update', room.getGameState());
    });

    // SOCKET.IO CONCEPT #10: Disconnect Event
    // Handles when a player leaves/disconnects
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.roomId && socket.playerId) {
        const room = gameRooms.get(socket.roomId);
        if (room) {
          room.removePlayer(socket.playerId);
          
          // Clean up empty rooms
          if (room.players.size === 0) {
            gameRooms.delete(socket.roomId);
          } else {
            // Notify remaining player that opponent left
            socket.to(socket.roomId).emit('player-left', room.getGameState());
          }
        }
      }
    });
  });

  // Start the server
  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, '0.0.0.0', () => { // Listen on all interfaces for Render
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
