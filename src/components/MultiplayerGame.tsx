"use client";
import { useSocket } from '@/contexts/SocketContext';
import Image from "next/image";

interface MultiplayerGameProps {
  onLeaveGame: () => void;
}

export default function MultiplayerGame({ onLeaveGame }: MultiplayerGameProps) {
  // SOCKET.IO USAGE: Get all multiplayer functionality from context
  const { 
    gameState,        // Current game state synced from server
    currentPlayer,    // This player's info (ID and symbol)
    roomId,           // Current room ID
    makeMove,         // Function to send moves to server
    setPlayerReady,   // Function to toggle ready status
    resetGame,        // Function to reset the game
    leaveRoom         // Function to leave the room
  } = useSocket();

  // LOADING STATE: Show loading while waiting for game data
  if (!gameState || !currentPlayer || !roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // MULTIPLAYER MOVE HANDLING: Send moves to server for validation
  const handleClick = async (index: number) => {
    // CLIENT-SIDE VALIDATION: Quick checks before sending to server
    if (gameState.board[index] || gameState.winner || !gameState.gameStarted) return;
    
    // TURN VALIDATION: Only allow moves on player's turn
    const isPlayerX = currentPlayer.symbol === 'x';
    if (isPlayerX !== gameState.xIsNext) return;

    // SOCKET.IO: Send move to server and wait for response
    const result = await makeMove(index);
    if (!result.success) {
      console.error('Move failed:', result.error);
    }
    // Note: Game state will be updated automatically via 'game-state-update' event
  };

  const handleResetGame = () => {
    // SOCKET.IO: Request game reset from server
    resetGame();
  };

  const handleLeaveGame = () => {
    // Clean up local state and notify parent component
    leaveRoom();
    onLeaveGame();
  };

  const handleReadyToggle = () => {
    // Toggle ready status and send to server
    const currentPlayerData = gameState.players.find(p => p.id === currentPlayer.id);
    setPlayerReady(!currentPlayerData?.isReady);
  };

  // UTILITY FUNCTIONS: Help determine game state and player info
  const isMyTurn = () => {
    if (!gameState.gameStarted) return false;
    const isPlayerX = currentPlayer.symbol === 'x';
    return isPlayerX === gameState.xIsNext;
  };

  const getCurrentPlayerData = () => {
    return gameState.players.find(p => p.id === currentPlayer.id);
  };

  const getOpponentData = () => {
    return gameState.players.find(p => p.id !== currentPlayer.id);
  };

  const currentPlayerData = getCurrentPlayerData();
  const opponentData = getOpponentData();

  // MULTIPLAYER STATE: Waiting for second player to join
  if (gameState.players.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Waiting for Opponent</h2>
          <p className="text-gray-600 mb-4">Room ID: <span className="font-mono font-bold">{roomId}</span></p>
          <p className="text-sm text-gray-500 mb-6">Share this room ID with your friend!</p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span>Waiting...</span>
          </div>
          <button
            onClick={handleLeaveGame}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // Game ready screen
  if (!gameState.gameStarted) {
    const allReady = gameState.players.every(p => p.isReady);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Game Ready!</h2>
          <p className="text-gray-600 mb-6">Room: <span className="font-mono">{roomId}</span></p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">You ({currentPlayer.symbol.toUpperCase()})</span>
              <span className={`px-2 py-1 rounded text-sm ${currentPlayerData?.isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {currentPlayerData?.isReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
            
            {opponentData && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-semibold">Opponent ({opponentData.symbol.toUpperCase()})</span>
                <span className={`px-2 py-1 rounded text-sm ${opponentData.isReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {opponentData.isReady ? 'Ready' : 'Not Ready'}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleReadyToggle}
              className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
                currentPlayerData?.isReady 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {currentPlayerData?.isReady ? 'Not Ready' : 'Ready to Play'}
            </button>
            
            {allReady && (
              <div className="text-green-600 font-semibold">
                🎉 All players ready! Game starting...
              </div>
            )}
            
            <button
              onClick={handleLeaveGame}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <>
      {/* Game status bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="text-sm">
            <span className="font-mono">{roomId}</span>
          </div>
          <div className="text-center">
            {gameState.winner ? (
              <span className="font-bold text-green-600">
                Winner: {gameState.winner.toUpperCase()}
              </span>
            ) : (
              <span className={`font-bold ${isMyTurn() ? 'text-blue-600' : 'text-gray-500'}`}>
                {isMyTurn() ? 'Your Turn' : `Opponent's Turn`}
              </span>
            )}
          </div>
          <button
            onClick={handleLeaveGame}
            className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Player indicators */}
      <section className="absolute w-screen flex flex-col h-svh bg-gray-50 pt-16">
        <main
          className={`${
            !gameState.xIsNext && "opacity-100"
          } flex items-end justify-center flex-1 w-full text-teal-700 font-bold p-3 rotate-180 select-none`}
        >
          <span>
            Player X {currentPlayer.symbol === 'x' && '(You)'}
            {opponentData?.symbol === 'x' && '(Opponent)'}
          </span>
        </main>
        <main
          className={`${
            gameState.xIsNext && "opacity-100"
          } flex items-end justify-center flex-1 w-full text-orange-700 font-bold p-3 select-none`}
        >
          <span>
            Player O {currentPlayer.symbol === 'o' && '(You)'}
            {opponentData?.symbol === 'o' && '(Opponent)'}
          </span>
        </main>
      </section>

      {/* Game board */}
      <section
        className={`transition-all duration-1000 ease-in-out ${
          gameState.xIsNext && !gameState.winner && "rotate-180"
        } absolute w-full flex flex-col items-center justify-center min-h-svh pt-16`}
      >
        <div className="grid grid-cols-3 border-2 border-gray-50">
          {gameState.board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              disabled={!isMyTurn() || gameState.winner !== null}
              aria-label={`cell-${idx}`}
              className={`text-white font-bold w-20 h-20 ${
                gameState.queueX.includes(idx)
                  ? "bg-teal-700"
                  : gameState.queueO.includes(idx)
                  ? "bg-orange-700"
                  : "bg-gray-200 hover:bg-gray-300"
              } border-2 border-gray-50 flex items-center justify-center text-2xl ${
                !gameState.winner &&
                ((gameState.xIsNext && gameState.queueX.length === 3 && gameState.queueX[0] === idx) ||
                  (!gameState.xIsNext && gameState.queueO.length === 3 && gameState.queueO[0] === idx))
                  ? "blink-animation"
                  : ""
              } transition-all duration-300 ease-in-out ${
                isMyTurn() && !gameState.winner ? 'cursor-pointer' : 'cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {cell}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleResetGame}
          aria-label="reset game"
          className="absolute bottom-24 flex justify-center items-center w-16 text-2xl font-light rotate-90 bg-transparent text-blue-950 rounded-full aspect-square hover:bg-gray-100 transition-all duration-300 ease-in-out cursor-pointer"
        >
          <Image
            src={gameState.winner ? "/reset.svg" : "/arrow.svg"}
            alt="reset / rotate"
            width={36}
            height={36}
            className={"-rotate-90"}
          />
        </button>
      </section>
    </>
  );
}
