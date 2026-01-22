import { useContext, useEffect, useState } from "react";
import { parse } from "marked";
import "./Chats.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/ContextProvider";
import api from "../../apis/api";
import Welcome from "../Welcome/Welcome";
import { connectSocket } from "../../utils/socket";
import { RiRobot2Line } from "react-icons/ri";

function Chats({ selectedChat }) {
  const {
    loadingReply,
    prevPrompts,
    setPrevPrompts,
    setLoading,
    socket,
    setSocket,
    isCreatingChat,
    setLoadingReply,
    socketRef,
  } = useContext(Context);

  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      if (isCreatingChat) return;

      if (prevPrompts.length > 0 && prevPrompts[0].chat === selectedChat) {
        return;
      }

      setPrevPrompts([]);
      setFetching(true);

      api
        .get(`/api/chat/${selectedChat}`)
        .then((response) => {
          const result = response.data.chat;
          setPrevPrompts(result);
          setFetching(false);
        })
        .catch((error) => {
          console.error("Error fetching chat data:", error);
          setFetching(false);
        });
    }
  }, [selectedChat, setPrevPrompts, isCreatingChat]);

  useEffect(() => {
    // 1. Determine which socket to use
    let activeSocket = socketRef.current;

    // If context doesn't have a connected socket, create one (Fallback)
    if (!activeSocket || !activeSocket.connected) {
      activeSocket = connectSocket();

      socketRef.current = activeSocket;
      setSocket(activeSocket); // Update Context so others use this too
    } else {
      console.log("[Chats] Reusing existing socket from Context.");
    }

    // 2. Attach the Listener to the ACTIVE socket
    const handleAiResponse = (message) => {
      // SECURITY CHECK:
      // Even if the pipe is shared, we ensure this message belongs to THIS chat.
      // (Optional but good practice)
      if (selectedChat && message.chat && message.chat !== selectedChat) {
        console.log("Ignored message for different chat:", message.chat);
        return;
      }


      setPrevPrompts((prev) => [
        ...prev,
        {
          role: "model",
          content: message.content,
        },
      ]);

      setLoadingReply(false);
    };;

    activeSocket.on("ai-response", handleAiResponse);

    // 3. Cleanup: Remove listener ONLY. Do NOT disconnect.
    return () => {
      console.log("[Chats] Cleaning up listener (Socket stays alive)");
      activeSocket.off("ai-response", handleAiResponse);
    };
  }, [selectedChat, setSocket, socketRef, setPrevPrompts, setLoadingReply]);
  // ^ Important: depend on 'socket' so if it changes, we re-bind.

  if (fetching) {
    return (
      <div
        className="loader-container"
        style={{ padding: "50px", width: "100%" }}
      >
        <div className="loader">
          <hr style={{ width: "100%" }} />
          <hr style={{ width: "80%" }} />
          <hr style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  return (
    prevPrompts.length > 0 &&
    prevPrompts.map((prompt, index) => (
      <div key={index}>
        {prompt.role === "user" && (
          <div className="user">
            <img src={assets.user_icon} alt="user icon" />
            <p className="user-message-box">{prompt.content}</p>
          </div>
        )}
        {prompt.role === "model" && (
          <div className="ai">
            <div className="ai-icon-container">
              <RiRobot2Line size={24} color="#5e5e5e" />
            </div>
            {/* <img src={assets.gemini_generated1}  alt="gemini icon" /> */}
            <div
              className="ai-message-box"
              dangerouslySetInnerHTML={{ __html: parse(prompt.content) }}
            ></div>
          </div>
        )}
        {prevPrompts.length - 1 === index && loadingReply && (
          <div className="ai">
            <div className="ai-icon-container">
              <RiRobot2Line size={24} color="#5e5e5e" />
            </div>
            {/* <img src={assets.gemini_icon} alt="gemini icon" /> */}
            <div className="loader">
              <hr />
              <hr />
              <hr />
            </div>
          </div>
        )}
      </div>
    ))
  );
}

export default Chats;
