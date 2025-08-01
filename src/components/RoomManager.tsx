"use client";
import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { v4 as uuidv4 } from 'uuid';

interface RoomManagerProps {
  onJoinedRoom: () => void;
}

export default function RoomManager({ onJoinedRoom }: RoomManagerProps) {
  const { createRoom, joinRoom, isConnected } = useSocket();
  const [roomInput, setRoomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const roomId = await createRoom();
      setCreatedRoomId(roomId);
      
      // Auto-join the created room
      const playerId = uuidv4();
      const result = await joinRoom(roomId, playerId);
      
      if (result.success) {
        onJoinedRoom();
      } else {
        setError(result.error || 'Failed to join room');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomInput.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const playerId = uuidv4();
      const result = await joinRoom(roomInput.toUpperCase(), playerId);
      
      if (result.success) {
        onJoinedRoom();
      } else {
        setError(result.error || 'Failed to join room');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span>Connecting to server...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Infinite Tic-Tac-Toe
        </h1>
        
        <div className="space-y-4">
          {/* Create Room */}
          <div>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create New Room'}
            </button>
            {createdRoomId && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  Room created! Share this ID: <strong className="font-mono">{createdRoomId}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Join Room */}
          <div>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              placeholder="Enter Room ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono tracking-wider"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={isLoading || !roomInput.trim()}
              className="w-full mt-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Share the room ID with your friend to play together!</p>
        </div>
      </div>
    </div>
  );
}
