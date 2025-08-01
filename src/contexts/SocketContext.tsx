"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// SOCKET.IO CLIENT CONCEPT #1: Type Definitions
// Define the shape of our game state that comes from the server
interface GameState {
  board: string[];
  xIsNext: boolean;
  queueX: number[];
  queueO: number[];
  winner: string | null;
  players: Array<{
    id: string;
    symbol: string;
    isReady: boolean;
  }>;
  gameStarted: boolean;
}

// REACT CONTEXT: Define what the context provides to components
interface SocketContextType {
  socket: Socket | null;           // The Socket.io connection object
  isConnected: boolean;           // Connection status
  gameState: GameState | null;    // Current game state from server
  currentPlayer: { id: string; symbol: string } | null;
  roomId: string | null;          // Current room ID
  // Functions to interact with the server
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string, playerId: string) => Promise<{ success: boolean; symbol?: string; error?: string }>;
  makeMove: (index: number) => Promise<{ success: boolean; error?: string }>;
  setPlayerReady: (ready: boolean) => void;
  resetGame: () => void;
  leaveRoom: () => void;
}

// REACT CONTEXT: Create the context
const SocketContext = createContext<SocketContextType | null>(null);

// CUSTOM HOOK: Provides easy access to socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// SOCKET.IO CLIENT CONCEPT #2: The Provider Component
// This component manages the Socket.io connection and provides it to children
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // STATE: Track socket connection and game data
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string; symbol: string } | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // SOCKET.IO CLIENT CONCEPT #3: Connection Setup
  useEffect(() => {
    // PRODUCTION READY: Get socket URL from environment variable or fallback
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                     (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    console.log('Connecting to socket server:', serverUrl);
    
    // Create Socket.io client connection to our server
    const socketInstance = io(serverUrl, {
      // Production optimizations
      transports: ['websocket', 'polling'], // Fallback for network issues
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000, // 20 second timeout
      forceNew: true  // Always create new connection
    });

    // SOCKET.IO EVENT: 'connect' - fired when connection is established
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    // SOCKET.IO EVENT: 'disconnect' - fired when connection is lost
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // CUSTOM EVENTS: Listen for game-specific events from server
    
    // When game state changes (moves, ready status, etc.)
    socketInstance.on('game-state-update', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    // When a new player joins the room
    socketInstance.on('player-joined', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    // When a player leaves the room
    socketInstance.on('player-left', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    setSocket(socketInstance);

    // CLEANUP: Disconnect when component unmounts
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // SOCKET.IO CLIENT CONCEPT #4: Emitting Events with Callbacks
  // Function to create a new room
  const createRoom = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      // EMIT EVENT: Send 'create-room' event to server with callback
      socket.emit('create-room', (response: { success: boolean; roomId?: string; error?: string }) => {
        if (response.success && response.roomId) {
          setRoomId(response.roomId);
          resolve(response.roomId);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  };

  // Function to join an existing room
  const joinRoom = (roomId: string, playerId: string): Promise<{ success: boolean; symbol?: string; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }

      // EMIT EVENT: Send room and player data to server
      socket.emit('join-room', { roomId, playerId }, (response: { success: boolean; symbol?: string; gameState?: GameState; error?: string }) => {
        if (response.success && response.symbol && response.gameState) {
          setRoomId(roomId);
          setCurrentPlayer({ id: playerId, symbol: response.symbol });
          setGameState(response.gameState);
        }
        resolve(response);
      });
    });
  };

  // Function to make a move
  const makeMove = (index: number): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }

      // EMIT EVENT: Send move to server and wait for validation
      socket.emit('make-move', { index }, (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  };

  // Simple emit functions (no callbacks needed)
  const setPlayerReady = (ready: boolean) => {
    if (socket) {
      // EMIT EVENT: Tell server about ready status change
      socket.emit('player-ready', { ready });
    }
  };

  const resetGame = () => {
    if (socket) {
      // EMIT EVENT: Request game reset
      socket.emit('reset-game');
    }
  };

  // LOCAL STATE: Clear local state (doesn't emit to server)
  const leaveRoom = () => {
    setRoomId(null);
    setCurrentPlayer(null);
    setGameState(null);
  };

  // REACT CONTEXT: Provide all socket functionality to child components
  return (
    <SocketContext.Provider value={{
      socket,              // Raw socket object (rarely used directly)
      isConnected,         // Connection status for UI feedback
      gameState,           // Real-time game state from server
      currentPlayer,       // This player's info
      roomId,              // Current room ID
      createRoom,          // Function to create new room
      joinRoom,            // Function to join existing room
      makeMove,            // Function to make a game move
      setPlayerReady,      // Function to toggle ready status
      resetGame,           // Function to reset the game
      leaveRoom            // Function to leave current room
    }}>
      {children}
    </SocketContext.Provider>
  );
};
