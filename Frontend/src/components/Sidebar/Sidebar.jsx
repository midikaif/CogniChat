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
  } = useContext(Context);

  const [chats, setChats] = useState([]);
  const [newChat, setNewChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const sendChat = (e) => {
    e.preventDefault();
    // Simulate chat creation success
    setChatInput("");
    setNotification("Chat created successfully!");
    setTimeout(() => setNotification(""), 2000);

    api
      .post(
        "/api/chat",
        { title: chatInput }
      )
      .then((response) => {
        console.log("Chat created:", response.data);
      })
      .catch((error) => {
        console.error("Error creating chat:", error);
      });
  };

  useEffect(() => {
    api
      .get("/api/chat")
      .then((response) => {
        const { chats } = response.data;
        setChats(chats);
      })
      .catch((error) => {
        console.error("Error fetching chat data:", error);
      });
  }, [notification]);

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

            <RecentChats chats={chats} />
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
