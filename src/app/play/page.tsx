"use client";
import React, { useEffect, useState, Suspense } from "react";
import ChessBoard from "@/components/chessBoard";
import { SocketProvider } from "@/contexts/socketContext";
import '@/styles/global.css';
import Loading from "@/components/Loading";

const GameRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRoomId(params.get("roomId") || "");
    setAuthToken(params.get("authToken") || "");
    setUsername(params.get("username") || "");
  }, []);

  if (!username || !authToken || !roomId) {
    return (
      <div className="text-red-500 text-lg font-semibold text-center mt-10">
        Invalid room or user information.
      </div>
    );
  }

  return (
      <main className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="w-full h-full bg-green-900 rounded-lg shadow-lg" style={{backgroundColor:"#073c07"}}>
        <Suspense fallback={<Loading />}>
          <SocketProvider>
              <ChessBoard roomId={roomId} authToken={authToken} username={username} />
          </SocketProvider>
          </Suspense>
        </div>
      </main>
  );

};

export default GameRoom;
