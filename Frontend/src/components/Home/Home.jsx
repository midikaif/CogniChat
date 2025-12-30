import { useContext, useEffect, useRef, useState } from "react";
import "./Home.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import Welcome from "../Welcome/Welcome";
import Chats from "../Chats/Chats";
import SearchBar from "../SearchBar/SearchBar";
import { Context } from "../../context/ContextProvider";
import api from "../../apis/api";


function Home() {

  const { selectedChat, prevPrompts, setSelectedChat } = useContext(Context);

  const [showSignout, setShowSignout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const resultRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try{
        await api.get('/api/auth/verify');
        setIsLoading(false);
      } catch (err){
        console.log("Auth failed, redirecting", err);
        navigate('login', {replace: true});
      }
    }
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [prevPrompts]);

  useEffect(() => {
    console.log("Home Component - selectedChat changed to:", selectedChat);
  }, [selectedChat]);

  const handleSignout = () => {
    setShowSignout(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="main">
      <div className="nav">
        <p onClick={() => setSelectedChat(null)} style={{cursor:"pointer"}}>Humen</p>
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
          {selectedChat ? (<Chats key={selectedChat} selectedChat={selectedChat} />) : (<Welcome />)}
        </div>

        <div className="main-bottom">
          <SearchBar />
          <div className="bottom-info">
            Humen may display inaccurate info, including about people, so double
            check its responses. Your privacy and Humen app.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
