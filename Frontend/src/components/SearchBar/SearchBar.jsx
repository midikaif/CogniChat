import { useContext, useState } from "react";
import { Context } from "../../Context/ContextProvider";
import { assets } from "../../assets/assets";
import "./SearchBar.css";
import { useNavigate, useParams } from "react-router-dom";

function SearchBar() {
  const {
    onSend,
    chats,
    startChatFromWelcome,
    loadingReply,
    setNotification,
    user
  } = useContext(Context);

  const navigate = useNavigate();
  const {chatId} = useParams();
  const [input, setInput] = useState("");

  const isGuestLocked = user?.isGuest && chats.length >= 1 && !chatId;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!input.trim() || isGuestLocked || loadingReply) return;

    if (chatId) {
      // SCENARIO 1: Chat already exists -> Just send message
      onSend(input, chatId);
    } else {
      // SCENARIO 2: No chat selected (Welcome Page) -> Create new chat
      const newChatId = await startChatFromWelcome(input);
      if (newChatId) {
        navigate(`/c/${newChatId}`, { state: { justCreated: true } });
      }
    }

    // Clear input
    setInput("");
  };

  const handleImageClick = () => {
    setNotification("Image and microphone features are not available yet.");
  };

  return (
    <>
      <form className="search-box" onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder={isGuestLocked ? "Guest limit (1 chat) reached. Open your recent chat." :
            loadingReply
              ? "CogniChat is thinking..."
              : "Type your message here..."
          }
          disabled={loadingReply || isGuestLocked}
          name="submit-btn"
        />
        <div className="search-icon">
          <button type="button" onClick={handleImageClick}>
            <img src={assets.gallery_icon} alt="gallery icon" />
          </button>
          <button type="button" onClick={handleImageClick}>
            <img src={assets.mic_icon} alt="mic icon" />
          </button>
          <button type="submit" disabled={loadingReply || !input.trim()}>
            <img src={assets.send_icon} alt="send icon" />
          </button>
        </div>
      </form>
    </>
  );
}

export default SearchBar;
