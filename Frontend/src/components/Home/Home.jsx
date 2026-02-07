import { useContext, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import "./Home.css";
import Welcome from "../Welcome/Welcome";
import Chats from "../Chats/Chats";
import SearchBar from "../SearchBar/SearchBar";
import { Context } from "../../Context/ContextProvider";

function Home() {
  const {
    selectedChat,
    prevPrompts,
    setPrevPrompts,
    isCreatingChat,
    loadingReply,
    user,
  } = useContext(Context);

  // useEffect(() => {
  //     if (
  //       !user && (location.pathname.includes("login") ||
  //       location.pathname.includes("signup"))
  //     ) {
  //       return;
  //     }

  //   if (resultRef.current) {
  //     resultRef.current.scrollTop = resultRef.current.scrollHeight;
  //   }
  // }, [prevPrompts, setPrevPrompts, loadingReply]);

  return (
    <div className="main">
      <div className="main-container">
        <div className="result">
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
