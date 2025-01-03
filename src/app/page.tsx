"use client";
import { useState } from "react";
import CreateLinkButton from "@/components/CreateLinkButton";
import { SocketProvider } from "@/contexts/socketContext";
import '@/styles/global.css';
const HomePage: React.FC = () => {
  const [link, setLink] = useState<string | null>(null);
  const [friendLink, setFriendLink] = useState<string | null>(null);

  const handleLinkGenerated = (generatedLink: string, generatedFriendLink: string) => {
    setLink(generatedLink);
    setFriendLink(generatedFriendLink);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 px-4">

      <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
        Welcome to Two-Player Chess
      </h1>
      <p className="text-gray-600 text-center max-w-xl mb-6">
        Play an exciting game of chess with your friend! Simply create a unique
        game link and share it with them to start playing. It&apos;s simple, fast,
        and fun!
      </p>
      <SocketProvider>
        <CreateLinkButton onLinkGenerated={handleLinkGenerated} />
      </SocketProvider>
      {link && friendLink && (
        <div className="mt-6 w-full max-w-lg text-center">
          <p className="text-gray-600 mb-2">Share this link with your friend:</p>
          <div className="bg-gray-100 p-4 rounded-md border border-gray-200 text-sm break-all">
            {window.location.origin}{friendLink}
          </div>

          <div className="mt-4">
            <a href={link} className="text-blue-500 font-semibold hover:underline">
              Join Room
            </a>
          </div>
        </div>
      )}
    </div>
  );
};


export default HomePage;
