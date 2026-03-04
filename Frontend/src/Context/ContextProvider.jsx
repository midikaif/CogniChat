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
  const [chats, setChats] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const socketRef = useRef(null);
  const chatCache = useRef({});

  //  SYNC: Whenever 'user' changes, update Local Storage
  useEffect(() => {
    if (user) {
      localStorage.setItem("cognichat_user", JSON.stringify(user));
    } else {
      // localStorage.removeItem("cognichat_user");
    }
  }, [user]);

  // BACKGROUND VERIFY: Check if the token is still valid on the server
  useEffect(() => {
    const verifyUser = async () => {
      // Only verify if we have a user locally
      // if (!user) return;

      try {
        const { data } = await api.get("/api/auth/verify");
        if (data.user) {
          // Update user with fresh data from server
          setUser(data.user);

          const isSameDay = (date1, date2) => {
            const d1 = new Date(date1);
            const d2 = new Date(date2);

            return (
              d1.getFullYear() === d2.getFullYear() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getDate() === d2.getDate()
            );
          };
          if (isSameDay(data.user.lastRequestDate, Date.now())) {
            const left = 20 - data.user.dailyRequests;
            setRequestsLeft(left);
          }
        }
      } catch (error) {
        // Token expired or invalid? Logout immediately.
        console.log("Session expired", error);
        !user.isGuest && localStorage.removeItem("cognichat_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Run this once when the app starts
    verifyUser();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleAiResponse = (message) => {
      // SECURITY CHECK:
      // Even if the pipe is shared, we ensure this message belongs to THIS chat.
      // (Optional but good practice)
      console.log("Received from backend: ", message);

      if (selectedChat && message.chat && message.chat !== selectedChat) {
        return;
      }

      const newHistory = {
        role: "model",
        content: message.content,
      };

      setPrevPrompts((prev) => {
        const updatedHistory = [...prev, newHistory];

        if (selectedChat) {
          chatCache.current[selectedChat] = updatedHistory;
        }

        return updatedHistory;
      });

      setLoadingReply(false);
    };

    const handleError = (err) => {
      console.error("Global socket error: ", err);
      setLoadingReply(false);
      setNotification(err.message || "An error occurred. Please try again.");
    };

    const handleQuotaUpdate = (data) => {
      const left = data.maxRequests - data.requestsUsed;
      setRequestsLeft(left);
    };

    socket.on("ai-response", handleAiResponse);
    socket.on("error", handleError);
    socket.on("quota-update", handleQuotaUpdate);

    return () => {
      socket.off("ai-response", handleAiResponse);
      socket.off("error", handleError);
      socket.off("quota-update", handleQuotaUpdate);
    };
  }, [socket, prevPrompts, selectedChat]);

  const fetchRecentChats = async () => {
    if (!user) {
      console.log("No user logged in", user);
      return;
    }

    try {
      setLoadingList(true);
      const response = await api.get("/api/chat");
      setChats(response.data.chats);
    } catch (err) {
      console.error("Error fetching recent chats: ", err);
      setNotification("Failed to load recent chats.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRecentChats();
  }, []);

  async function deleteChat(e, id) {
    e.stopPropagation();
    setChats((prevChats) => prevChats.filter((chat) => chat._id !== id));

    if (selectedChat === id) {
      setSelectedChat(null);
      setPrevPrompts([]);
    }

    setNotification("Chat deleted successfully!");
    try {
      await api.delete(`/api/chat/${id}`, { withCredentials: true });
      await fetchRecentChats();
    } catch (err) {
      console.log("Delete failed: ", err);
    }

    showNotification("");
  }

  const loadChat = async (chatId) => {
    if (chatCache.current[chatId]) {
      console.log(`[Cache] Loaded chat ${chatId} from memory.`);
      setPrevPrompts(chatCache.current[chatId]);
      return true; // Exit early! No API call needed.
    }

    console.log(`[API] Fetching chat ${chatId}...`);

    try {
      const response = await api.get(`/api/chat/${chatId}`);
      const freshData = response.data.chat;

      chatCache.current[chatId] = freshData;

      setPrevPrompts(freshData);
      console.log("chat cache in context -> ", chatCache.current);
      return true;
    } catch (error) {
      console.error("Error loading chat:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCache = (chatId, updatedHistory) => {
    chatCache.current[chatId] = updatedHistory;
  };

  const emitToBackend = (payload) => {
    console.log(socketRef.current);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("ai-message", payload);
    } else {
      console.error("Socket dead, reconnecting...");
      const newSocket = connectSocket();
      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.once("connect", () => {
        console.log("Socket connected, payload sending");
        newSocket.emit("ai-message", payload);
      });
    }
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

        emitToBackend(payload);

        return newChat._id;
      } else {
        console.error("Critical: No chat ID returned from server");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      setNotification("Failed to start chat. Please try again.");
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

    const payload = {
      chat: chatId,
      content: prompt,
    };

    emitToBackend(payload);
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
    loadingList,
    setLoadingList,
    chats,
    setChats,
    deleteChat
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
