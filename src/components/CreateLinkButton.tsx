import { useState } from "react";
import { useSocket } from "@/contexts/socketContext";

interface CreateLinkButtonProps {
  onLinkGenerated: (link: string, friendLink: string) => void;
  time: number;
}

const CreateLinkButton: React.FC<CreateLinkButtonProps> = ({ onLinkGenerated,time }) => {
  const socket = useSocket();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  async function fetchData(link: string) {
    const data = await fetch(link);
    return await data.json();
  }

  const handleCreateLink = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const roomDetails = await fetchData("/ids");
      const generatedLink = `/play/?roomId=${roomDetails.roomId}&authToken=${roomDetails.authToken}&username=${roomDetails.username}`;

      socket.emit(
        "createRoom",
        {
          roomId: roomDetails.roomId,
          authToken: roomDetails.authToken,
          username: roomDetails.username,
          time: time
        },
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            console.log("Room created successfully:", response.message);
            const friendLink = `/play/?roomId=${roomDetails.roomId}&authToken=${roomDetails.authToken}&username=${response.message}`;
            onLinkGenerated(generatedLink, friendLink);
            setIsButtonDisabled(true);
          } else {
            console.error("Error creating room:", response.message);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  return (
    <button
      onClick={handleCreateLink}
      disabled={isButtonDisabled}
      className={`px-6 py-3 text-lg font-medium text-white rounded-lg transition 
        ${isButtonDisabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
        }`}
    >
      {isButtonDisabled ? "Link Created" : "Create Link"}
    </button>
  );
};

export default CreateLinkButton;
