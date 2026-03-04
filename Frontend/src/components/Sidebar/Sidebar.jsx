import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import api from "../../apis/api";
import { TiSocialLinkedinCircular } from "react-icons/ti";
import { FaGithub } from "react-icons/fa";
import { Context } from "../../Context/ContextProvider";
import RecentChats from "../RecentChats/RecentChats";

function Sidebar() {
  const {
    notification,
    setNotification,
    setExtended,
    extended,
    showNotification,
    selectedChat,
    setSelectedChat,
    setPrevPrompts,
    isCreatingChat,
    user,
    setUser,
    loadingList,
    chats,
    setChats
  } = useContext(Context);

  const [newChat, setNewChat] = useState(false);

  const navigate = useNavigate();

  const handleSignout = async () => {
      console.log('Signing out');
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className={`sidebar ${extended ? "extended" : ""}`}>
      <img
        className="menu"
        onClick={() => {
          setExtended((prev) => !prev);
          if (newChat) setNewChat(false);
        }}
        src={assets.menu_icon}
        alt="menu icon"
      />

      <div className="top">
        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {loadingList ? (
              <div className="skeleton-list">
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
              </div>
            ) : (
              <RecentChats chats={chats} />
            )}
          </div>
        )}

        {user?.isGuest && extended ? (
          <>
            <div className="guest-warning">
              Chats are temporary.
              <span onClick={handleSignout} style={{ cursor: "pointer" }}>
                Log in to save.
              </span>
            </div>
          </>
        ) : (
          !user?.isGuest && (
            <div className="new-chat">
              <div
                onClick={() => {
                  navigate("/");
                }}
                className="chat-icons"
              >
                <img src={assets.plus_icon} alt="" />
                {extended && <p>New Chat</p>}
              </div>
            </div>
          )
        )}
      </div>
      {notification && user && showNotification()}
      <div className="bottom">
        {/* --- CHANGE 1: Source Code (GitHub) --- */}
        <a
          href="https://github.com/midikaif/CogniChat"
          target="_blank"
          rel="noopener noreferrer"
          className="bottom-item recent-entry"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {/* Assuming you add a github_icon to your assets! */}
          <FaGithub />
          {extended ? <p>View Source Code</p> : null}
        </a>

        {/* --- CHANGE 2: Hire the Dev (LinkedIn) --- */}
        <a
          href="https://www.linkedin.com/in/md-kaif-khan/"
          target="_blank"
          rel="noopener noreferrer"
          className="bottom-item recent-entry"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <TiSocialLinkedinCircular />
          {extended ? <p>Hire the Dev</p> : null}
        </a>
      </div>
    </div>
  );
}

export default Sidebar;
