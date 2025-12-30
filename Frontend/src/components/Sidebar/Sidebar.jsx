import React, { useContext, useEffect, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import api from "../../apis/api";
import { IoIosArrowBack, IoMdSend } from "react-icons/io";
import { Context } from "../../context/ContextProvider";
import RecentChats from "../RecentChats/RecentChats";

function Sidebar() {
  const {
    notification,
    setNotification,
    setExtended,
    extended,
    setSettings,
    showNotification,
    selectedChat,
    setSelectedChat,
    setPrevPrompts
  } = useContext(Context);

  const [loadingList, setLoadingList] = useState(true);
  const [chats, setChats] = useState([]);
  const [newChat, setNewChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    setLoadingList(true);
    api
      .get("/api/chat")
      .then((response) => {
        setChats(response.data.chats);
        setLoadingList(false);
      })
      .catch((error) => {
        console.error("Error fetching chat data:", error);
        setLoadingList(false);
      });
  }, []);

  const sendChat = (e) => {
    e.preventDefault();
    // Simulate chat creation success
    setChatInput("");
    setNotification("Chat created successfully!");
    setTimeout(() => setNotification(""), 2000);

    api
      .post("/api/chat", { prompt: chatInput })
      .then((response) => {
        console.log("Chat created:", response.data);
        setChats(prev => [...prev, response.data.chat])
      })
      .catch((error) => {
        console.error("Error creating chat:", error);
      });
  };



  async function onDeleteChat(e, id) {
    e.stopPropagation();
    setChats((prevChats) => prevChats.filter((chat) => chat._id !== id));

    if(selectedChat === id){
      setSelectedChat(null);
      setPrevPrompts([]);
    }

    setNotification("Chat deleted successfully!");
    try{
      await api
      .delete(`/api/chat/${id}`, { withCredentials: true })
    }catch(err){
      console.log("Delete failed: ",err);

    }
      
    showNotification("");
  }

  return (
    <div className="sidebar">
      <div className="top">
        <img
          className="menu"
          onClick={() => {
            setExtended((prev) => !prev);
            if (newChat) setNewChat(false);
          }}
          src={assets.menu_icon}
          alt="menu icon"
        />

        <div className="new-chat">
          <div
            onClick={() => {
              setNewChat((prev) => !prev);
              setExtended(true);
            }}
            className="chat-icons"
          >
            {newChat ? (
              <IoIosArrowBack />
            ) : (
              <img src={assets.plus_icon} alt="" />
            )}
            {extended && !newChat && <p>New Chat</p>}
          </div>
          {newChat && extended && (
            <form
              className="chat-input-container"
              onSubmit={(e) => {
                sendChat(e);
              }}
            >
              <input
                type="text"
                className="chat-input"
                autoFocus
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                required
              />
              <button className="submit-btn" type="submit">
                <IoMdSend size={20} />
              </button>
            </form>
          )}
        </div>

        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {/* 2. LOADING LOGIC */}
            {loadingList ? (
              <div className="skeleton-list">
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
              </div>
            ) : (
              <RecentChats chats={chats} onDeleteChat={onDeleteChat} />
            )}
          </div>
        )}
      </div>
      {notification && showNotification()}
      <div className="bottom">
        <div
          className="bottom-item recent-entry"
          onClick={() => {
            setNotification("Read the DOCS!");
            showNotification();
          }}
        >
          <img src={assets.question_icon} alt="question icon" />
          {extended && <p>Help</p>}
        </div>

        <div
          className="bottom-item recent-entry"
          onClick={() => {
            setSettings((prev) => !prev);
          }}
        >
          <img src={assets.setting_icon} alt="setting icon" />
          {extended && <p>Settings</p>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
