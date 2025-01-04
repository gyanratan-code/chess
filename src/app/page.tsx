"use client";
import { useState } from "react";
import CreateLinkButton from "@/components/CreateLinkButton";
import { SocketProvider } from "@/contexts/socketContext";
import '@/styles/global.css';
const HomePage: React.FC = () => {
  const [link, setLink] = useState<string | null>(null);
  const [friendLink, setFriendLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [time, setTime] = useState(10);

  const handleLinkGenerated = (generatedLink: string, generatedFriendLink: string) => {
    setLink(generatedLink);
    setFriendLink(generatedFriendLink);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val.length == 0) {
      setTime(0);
    } else {
      setTime(parseInt(event.target.value));
    }
  }
  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}${friendLink}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset Persiod \to:do-changeable
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
      {link || (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <label htmlFor="minutes" className="text-base font-medium text-gray-800">
            Enter Minutes:
          </label>
          <input
            type="number" min="1" value={time} onChange={handleTimeChange}
            className="w-full px-4 py-3 text-lg text-gray-900 border border-gray-300 rounded-lg shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition bg-white"
          />
        </div>
      )}
      <SocketProvider>
        <CreateLinkButton onLinkGenerated={handleLinkGenerated} time={time * 60 * 1000} />
      </SocketProvider>
      {link && friendLink && (
        <div className="mt-6 w-full max-w-lg text-center">
          <p className="text-gray-600 mb-2">Share this link with your friend:</p>
          <div className="flex items-center bg-gray-100 p-4 rounded-md border border-gray-200 text-sm">
            <span className="break-all">{`${window.location.origin}${friendLink}`}</span>
            <button
              onClick={handleCopy}
              className={`ml-4 px-3 py-1 rounded-md text-white font-medium ${isCopied ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isCopied ? "Copied" : "Copy"}
            </button>
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
