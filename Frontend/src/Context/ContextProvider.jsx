import { createContext, useState, useEffect, useRef } from "react";
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
  const [selectedChat, setSelectedChat] = useState(null);
  const [settings, setSettings] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const startChatFromWelcome = async (prompt) => {
    console.log("[Step 1] startChatFromWelcome triggered with prompt:", prompt);
    setIsCreatingChat(true);
    setShowResult(true);
    setLoadingReply(true);

    setPrevPrompts([
      {
        role: "user",
        content: prompt,
        // No 'chat' ID yet, that's okay for display
      },
    ]);
    console.log("[Step 2] Optimistic UI updated (User message shown)");


    try {
      console.log("[Step 3] Sending API request to create chat ID...");
      const response = await api.post("api/chat", { prompt: prompt });
      console.log("[Step 4] API Response received:", response.data);

      const newChat = response.data.chat;
      if (!newChat) {
        console.error("API did not return a chat object");
        return;
      }

      if (newChat && newChat._id) {
        console.log("[Step 5] Valid Chat ID received:", newChat._id);

        setPrevPrompts([
          {
            role: "user",
            chat: newChat._id,
            content: prompt,
          },
        ]);

        setSelectedChat(newChat._id);
        setIsCreatingChat(false);

        console.log(
          "[Step 6] SelectedChat updated and isCreatingChat set to false",
        );

        // setPrevPrompts((prev) => [...prev, newChat]);

        // setLoadingReply(false);

        // console.log(prevPrompts);

        setNotification("New Conversation Started");
        
        // --- FIXED SOCKET LOGIC ---
        // let activeSocket = socket;

        // Check if we need to connect manually
        if (!socketRef.current || !socketRef.current.connected) {
          console.log(
            "[Step 7a] Socket was null/disconnected. Connecting now...",
          );
          const newSocket = connectSocket(); // Connect immediately
          // 1. Save to Ref (INSTANT)
          socketRef.current = newSocket;

          // 2. Save to State (For re-renders, happens later)
          setSocket(newSocket);
        }

        console.log("[Step 7b] Emitting 'ai-message'...");
        socketRef.current.emit("ai-message", {
          chat: newChat._id,
          content: prompt,
        });
      } else {
        console.error("Critical: No chat ID returned from server");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      setLoadingReply(false);
    }
  };

  const onSend = async (prompt, chatId) => {
    // 1. Input Validation
    if (!prompt.trim()) return;

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
    loadingReply,
    setLoadingReply,
    socketRef
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
