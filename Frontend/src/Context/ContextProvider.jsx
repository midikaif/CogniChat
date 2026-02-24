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
  const [loading, setLoading] = useState(true);
  const [loadingReply, setLoadingReply] = useState(false);
  const [socket, setSocket] = useState(null);
  const [requestsLeft, setRequestsLeft] = useState(20);
  const socketRef = useRef(null);
  const chatCache = useRef({});

  //  SYNC: Whenever 'user' changes, update Local Storage
  useEffect(() => {
    if (user) {
      localStorage.setItem("cognichat_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cognichat_user");
    }
  }, [user]);

  // BACKGROUND VERIFY: Check if the token is still valid on the server
  useEffect(() => {
    const verifyUser = async () => {
      // Only verify if we have a user locally
      // if (!user) return;

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
      } finally {
        setLoading(false);
      }
    };

    // Run this once when the app starts
    verifyUser();
  }, []);

  const loadChat = async (chatId) => {
    if (chatCache.current[chatId]) {
      console.log(`[Cache] Loaded chat ${chatId} from memory.`);
      setPrevPrompts(chatCache.current[chatId]);
      return; // Exit early! No API call needed.
    }

    console.log(`[API] Fetching chat ${chatId}...`);

    try {
      const response = await api.get(`/api/chat/${chatId}`);
      const freshData = response.data.chat;

      chatCache.current[chatId] = freshData;

      setPrevPrompts(freshData);
      console.log("chat cache in context -> ", chatCache.current);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const updateCache = (chatId, updatedHistory) => {
    chatCache.current[chatId] = updatedHistory;
  };

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

        setNotification("New Conversation Started");

        const payload = {
          chat: newChat._id,
          content: prompt,
          isFirstMessage: true,
        };

        console.log("sending payload -> ", payload);

        // 1. IS THE PHONE ALREADY CONNECTED?
        if (socketRef.current && socketRef.current.connected) {
          // Great! Speak immediately.
          socketRef.current.emit("ai-message", payload);
        } else {
          // 2. PHONE IS DEAD. TURN IT ON.
          const newSocket = connectSocket();
          socketRef.current = newSocket;
          setSocket(newSocket);

          // 3. WAIT FOR THE TOWER SIGNAL BEFORE SPEAKING!
          // We use .once instead of .on so it only triggers this specific time
          newSocket.once("connect", () => {
            console.log(
              "Socket finally connected! Now sending delayed payload...",
            );
            newSocket.emit("ai-message", payload);
          });
        }
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
    const newHistory = [
      ...prevPrompts,
      {
        role: "user",
        chat: chatId,
        content: prompt,
      },
    ];

    setPrevPrompts((prev) => [
      ...prev,
      {
        role: "user",
        chat: chatId,
        content: prompt,
      },
    ]);

    if (selectedChat) {
      chatCache.current[chatId] = newHistory;
    }

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
    socketRef,
    loadChat,
    updateCache,
    chatCache,
    requestsLeft,
    setRequestsLeft,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
