import { createContext, useState, useEffect, useRef } from "react";
import { MdCheckCircle } from "react-icons/md";
import { connectSocket } from "../utils/socket";
import api from "../apis/api";

const Context = createContext();

export { Context };

const ContextProvider = (props) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("cognichat_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
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

  //  SYNC: Whenever 'user' changes, update Local Storage
  useEffect(() => {
    if (user) {
      localStorage.setItem("cognichat_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cognichat_user");
    }
  }, [user]);

  // 3. BACKGROUND VERIFY: Check if the token is still valid on the server
  useEffect(() => {
    const verifyUser = async () => {
      // Only verify if we have a user locally
      if (!user) return;

      try {
        const { data } = await api.get("/api/auth/verify");
        if (data.success) {
          // Update user with fresh data from server
          setUser(data.user);
        }
      } catch (error) {
        // Token expired or invalid? Logout immediately.
        console.log("Session expired", error);
        setUser(null);
        localStorage.removeItem("cognichat_user");
      }
    };

    // Run this once when the app starts
    verifyUser();
  }, []);

  const startChatFromWelcome = async (prompt) => {
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

    try {
      const response = await api.post("api/chat", { prompt: prompt });

      const newChat = response.data.chat;
      if (!newChat) {
        console.error("API did not return a chat object");
        return;
      }

      if (newChat && newChat._id) {
        setPrevPrompts([
          {
            role: "user",
            chat: newChat._id,
            content: prompt,
          },
        ]);

        setSelectedChat(newChat._id);
        setIsCreatingChat(false);

        // setPrevPrompts((prev) => [...prev, newChat]);

        // setLoadingReply(false);

        // console.log(prevPrompts);

        setNotification("New Conversation Started");

        // --- FIXED SOCKET LOGIC ---
        // let activeSocket = socket;

        // Check if we need to connect manually
        if (!socketRef.current || !socketRef.current.connected) {
          const newSocket = connectSocket(); // Connect immediately
          // 1. Save to Ref (INSTANT)
          socketRef.current = newSocket;

          // 2. Save to State (For re-renders, happens later)
          setSocket(newSocket);
        }

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
    setLoadingReply(true);
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

  const showNotification = (e) => {
    console.log(e);
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
    socketRef,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};;

export default ContextProvider;
