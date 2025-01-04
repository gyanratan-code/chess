import Loading from "@/components/Loading";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io("wss://chess-backend-b7hj.onrender.com", { transports: ["websocket"] });
    setSocket(socketInstance); // state store of socket instance

    socketInstance.on("connect", () => {
      console.log("WebSocket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  if (!socket) {
    // Render the Loading page please
    return (
      <Loading />
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): Socket => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
