import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import api from "../../apis/api";
import { IoIosArrowBack, IoMdSend } from "react-icons/io";
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
    setUser
  } = useContext(Context);

  const [loadingList, setLoadingList] = useState(true);
  const [chats, setChats] = useState([]);
  const [newChat, setNewChat] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
    if(!user){
      return;
    }
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
  }, [isCreatingChat, chats.length, user]);

  async function onDeleteChat(e, id) {
    e.stopPropagation();
    setChats((prevChats) => prevChats.filter((chat) => chat._id !== id));

    if (selectedChat === id) {
      setSelectedChat(null);
      setPrevPrompts([]);
    }

    setNotification("Chat deleted successfully!");
    try {
      await api.delete(`/api/chat/${id}`, { withCredentials: true });
    } catch (err) {
      console.log("Delete failed: ", err);
    }

    showNotification("");
  }

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

      {user?.isGuest && extended ? (
        <div className="guest-warning">
          Chats are temporary.
          <span onClick={handleSignout} style={{ cursor: "po" }}>
            Log in to save.
          </span>
        </div>
      ) : (
        <div className="top">
        {!user.isGuest && (
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
          </div>)}

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
                <RecentChats chats={chats} onDeleteChat={onDeleteChat} />
              )}
            </div>
          )}
        </div>
      )}
      {notification && user && showNotification()}
      <div className="bottom">
        {/* --- CHANGE 1: Help Button --- */}
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>

        {/* --- CHANGE 2: Activity Button --- */}
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>

        {/* --- CHANGE 3: Settings Button --- */}
        {/* We wrap the div in NavLink so it behaves like a real link */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "bottom-item recent-entry active-link"
              : "bottom-item recent-entry"
          }
        >
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </NavLink>
      </div>

    </div>
  );
}

export default Sidebar;
