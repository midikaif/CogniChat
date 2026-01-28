import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "./Home.css";
import Welcome from "../Welcome/Welcome";
import Chats from "../Chats/Chats";
import SearchBar from "../SearchBar/SearchBar";
import { Context } from "../../Context/ContextProvider";
import api from "../../apis/api";

function Home() {
  const {
    selectedChat,
    prevPrompts,
    isCreatingChat,
    loadingReply,
    user,
    setLoading,
  } = useContext(Context);

  const navigate = useNavigate();

  const resultRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        return;
      }
      try {
        await api.get("/api/auth/verify");
        console.log("auth verify");
      } catch (err) {
        console.log("Auth failed, redirecting", err);
        navigate("login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate, user, setLoading]);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [prevPrompts, loadingReply]);

  return (
    <div className="main">
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
      <Outlet />
    </div>
  );
}

export default Home;
