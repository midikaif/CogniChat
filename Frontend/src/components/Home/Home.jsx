import { useContext } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import "./Home.css";
import Welcome from "../Welcome/Welcome";
import Chats from "../Chats/Chats";
import SearchBar from "../SearchBar/SearchBar";
import { Context } from "../../Context/ContextProvider";
import {useEffect} from "react";

function Home() {
  const {
    selectedChat,
    setSelectedChat,
    isCreatingChat,
    loadChat,
    setNotification,
  } = useContext(Context);

  const navigate = useNavigate();
  const location = useLocation();
  const {chatId} = useParams();

  useEffect(() => {
    const validUrlCheck = async () => {
      if (chatId) {
        if (location.state?.justCreated) {
          setSelectedChat(chatId);
          navigate(location.pathname, { replace: true, state: {} });
          return;
        }
        const isValid = await loadChat(chatId);

        if (!isValid) {
          setNotification("The chat you are trying to access does not exist.");
          navigate("/", { replace: true });
        } else{
          setSelectedChat(chatId);
        }
      }
    };
    validUrlCheck();
  }, [chatId, setSelectedChat]);

  return (
    <div className="main">
      <div className="main-container">
        <div className="result">
          {chatId || isCreatingChat ? (
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
