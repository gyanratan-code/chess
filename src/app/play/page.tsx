"use client";

import React, { useEffect, useState } from "react";
import Clock from "@/components/Clock";
import ChessBoard from "@/components/chessBoard";
import { SocketProvider } from "@/contexts/socketContext";
import '@/styles/global.css';

const GameRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [username, setUsername] = useState("");
  const [isOpponentJoined, setIsOpponentJoined] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRoomId(params.get("roomId") || "");
    setAuthToken(params.get("authToken") || "");
    setUsername(params.get("username") || "");

    const simulateOpponentJoin = setTimeout(() => {
      setIsOpponentJoined(true);
    }, 5000);

    return () => clearTimeout(simulateOpponentJoin);
  }, []);

  if (!username || !authToken || !roomId) {
    return (
      <div className="text-red-500 text-lg font-semibold text-center mt-10">
        Invalid room or user information.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-800">Welcome to Chess Game</h1>
        <div className="text-sm flex justify-center space-x-4">
          <p className="text-gray-600">Room ID: {roomId}</p>
          <p className="text-gray-600">Username: {username}</p>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center">
        {!isOpponentJoined ? (
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <p className="text-xl font-semibold text-gray-800 mb-4">Waiting for opponent to join...</p>
          </div>
        ) : (
          <div className="w-full bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between w-full mb-4">
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-700">Opponent&apos;s Clock</p>
                <Clock totalTime={300} />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-700">Your Clock</p>
                <Clock totalTime={300} />
              </div>
            </div>
            <div>
              <SocketProvider>
                <ChessBoard roomId={roomId} authToken={authToken} username={username} />
              </SocketProvider>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameRoom;
