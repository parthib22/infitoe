"use client";
import { useState } from "react";
import SinglePlayerGame from "@/components/SinglePlayerGame";
import RoomManager from "@/components/RoomManager";
import MultiplayerGame from "@/components/MultiplayerGame";

type GameMode = 'select' | 'single' | 'multiplayer-lobby' | 'multiplayer-game';

export default function GameModeSelector() {
  const [gameMode, setGameMode] = useState<GameMode>('select');

  const handleJoinedRoom = () => {
    setGameMode('multiplayer-game');
  };

  const handleLeaveGame = () => {
    setGameMode('select');
  };

  const handleBackToMenu = () => {
    setGameMode('select');
  };

  if (gameMode === 'single') {
    return (
      <div>
        <button
          onClick={handleBackToMenu}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded shadow-md transition-colors"
        >
          ← Back
        </button>
        <SinglePlayerGame />
      </div>
    );
  }

  if (gameMode === 'multiplayer-lobby') {
    return <RoomManager onJoinedRoom={handleJoinedRoom} />;
  }

  if (gameMode === 'multiplayer-game') {
    return <MultiplayerGame onLeaveGame={handleLeaveGame} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-6xl text-blue-950 font-bold mb-4">infitoe</h1>
        <p className="text-lg text-gray-700 max-w-md mx-auto">
          We fixed tic-tac-toe. No more boring ties, just pure strategy.
        </p>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <button
          onClick={() => setGameMode('single')}
          className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg font-semibold transition-colors shadow-md"
        >
          🎮 Single Player
          <div className="text-sm font-normal text-blue-100 mt-1">
            Play with a friend on the same device
          </div>
        </button>

        <button
          onClick={() => setGameMode('multiplayer-lobby')}
          className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-lg font-semibold transition-colors shadow-md"
        >
          🌐 Online Multiplayer
          <div className="text-sm font-normal text-green-100 mt-1">
            Play with friends anywhere in the world
          </div>
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600 max-w-lg">
        <p className="mb-2">
          <strong>How to play:</strong> Get 3 in a row, but here&apos;s the twist - you can only have 3 pieces on the board at a time!
        </p>
        <p>
          When you place a 4th piece, your oldest piece disappears. Strategy is everything! 🧠
        </p>
      </div>
    </div>
  );
}
