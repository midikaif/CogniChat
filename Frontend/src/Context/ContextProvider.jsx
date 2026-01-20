import { createContext, useState, useEffect } from "react";
import { MdCheckCircle } from "react-icons/md";
import { connectSocket } from "../utils/socket";
import api from "../apis/api";

const Context = createContext();

export { Context };

const ContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [notification, setNotification] = useState("");
  const [extended, setExtended] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [settings, setSettings] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loading, setLoading] = useState(false);


  const startChatFromWelcome = async (prompt) => {
    setIsCreatingChat(true);
    setLoading(true);
    setShowResult(true);
    
    setPrevPrompts([
      {
        role: "user",
        content: prompt,
        // No 'chat' ID yet, that's okay for display
      },
    ]);
    
    try {
      console.log("Sending API request for:", prompt); // Debug Log 1

      const response = await api.post("api/chat", { prompt: prompt });
      console.log("Server Response:", response.data); // <--- Add this to debug

      const newChat = response.data.chat;
      if (!newChat) {
        console.error("API did not return a chat object");
        return;
      }

      if (newChat && newChat._id) {
        setIsCreatingChat(false); 
        const initialMessage = [
          {
            role: "user",
            chat: newChat._id,
            content: prompt,
          },
        ];
        
        setPrevPrompts(initialMessage);
        
        setSelectedChat(newChat._id);
        
        console.log(prevPrompts)
        
        setLoading(false);
        setNotification("New Conversation Started");

        if (socket && socket.connected) {
          socket.emit("ai-message", {
            chat: newChat._id,
            content: prompt,
          });
        }
      } else {
        console.error(
          "Critical: No chat ID returned from server",
          response.data
        );
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const onSend = async (prompt, chatId) => {
    // 1. Input Validation
    if (!prompt.trim()) return;

    setLoading(true);
    setShowResult(true);

    // 2. Optimistic Update (Show user message immediately)
    setPrevPrompts((prev) => [
      ...prev,
      {
        role: "user",
        chat: chatId,
        content: prompt,
      },
    ]);

    // 3. Socket Safety Check
    if (socket && socket.connected) {
      socket.emit("ai-message", {
        chat: chatId,
        content: prompt,
      });
      
    } else {
      console.error("Socket not connected. Reconnecting...");
      setNotification("Connection lost. Retrying...");

      // Emergency Reconnect Logic
      const newSocket = connectSocket();
      newSocket.on("connect", () => {
        newSocket.emit("ai-message", { chat: chatId, content: prompt });
      });
      setSocket(newSocket);
    }
  };

  const showNotification = () => {
    return (
      <div className="notification" style={{}}>
        <MdCheckCircle size={24} style={{ marginRight: 6 }} />
        {notification}
      </div>
    );
  };

  // Fix for Notification clearing loop
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const contextValue = {
    startChatFromWelcome,
    prevPrompts,
    setPrevPrompts,
    onSend,
    setUserPrompt,
    userPrompt,
    showResult,
    loading,
    setLoading,
    input,
    setInput,
    selectedChat,
    setSelectedChat,
    user,
    setUser,
    notification,
    setNotification,
    extended,
    setExtended,
    setSocket,
    settings,
    setSettings,
    showNotification,
    isCreatingChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
