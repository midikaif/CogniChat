import { useContext, useEffect, useRef, useState } from "react";
import "./Home.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import Welcome from "../Welcome/Welcome";
import Chats from "../Chats/Chats";
import SearchBar from "../SearchBar/SearchBar";
import { Context } from "../../Context/ContextProvider";
import api from "../../apis/api";
import LoginSignup from "../LoginSignup/LoginSignup";

function Home() {
  const { selectedChat, prevPrompts, setSelectedChat, isCreatingChat, setUser, user } =
    useContext(Context);

  const [showSignout, setShowSignout] = useState(false);

  const navigate = useNavigate();

  const resultRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/api/auth/verify");
        console.log("auth verify");
      } catch (err) {
        console.log("Auth failed, redirecting", err);
        navigate("login", { replace: true });
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [prevPrompts]);

  const handleSignout = async () => {
    setShowSignout(false);
    try {
    await api.post('/api/auth/logout');
    // After server says OK, update frontend state
    setUser(null); 
    navigate('/login');
  } catch (err) {
    console.error("Logout failed", err);
  }
  };

  return (
    <div className="main">
      <div className="nav">
        <p onClick={() => setSelectedChat(null)} style={{ cursor: "pointer" }}>
          CogniChat
        </p>
        <div style={{ position: "relative" }}>
          <img
            src={assets.user_icon}
            alt="user icon"
            style={{ cursor: "pointer" }}
            onClick={() => setShowSignout((prev) => !prev)}
          />
          {showSignout && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                right: 0,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: "12px 10px",
                zIndex: 10,
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, color: "#3c009d", fontWeight: 500 }}>
                Sign out?
              </p>
              <button
                style={{
                  marginTop: "10px",
                  padding: "6px 18px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#4b90ff",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={handleSignout}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="main-container">
        <div className="result" ref={resultRef}>
          {selectedChat || isCreatingChat ? (
            <Chats selectedChat={selectedChat} />
          ) : (
            <Welcome />
          )}
        </div>

        <div className="main-bottom">
          <SearchBar />
          <div className="bottom-info">
            CogniChat may display inaccurate info, including about people, so
            double check its responses. Your privacy and CogniChat app.
          </div>
        </div>
      </div>

      {!user && <LoginSignup />}
    </div>
  );
}

export default Home;
