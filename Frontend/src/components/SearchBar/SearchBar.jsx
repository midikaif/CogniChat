import {useContext, useState} from 'react'
import {Context} from '../../Context/ContextProvider';
import { assets } from "../../assets/assets";



function SearchBar() {
  const { onSend, selectedChat, startChatFromWelcome } = useContext(Context);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!input.trim()) return;

    if (selectedChat) {
      // SCENARIO 1: Chat already exists -> Just send message
      onSend(input, selectedChat);
    } else {
      // SCENARIO 2: No chat selected (Welcome Page) -> Create new chat
      startChatFromWelcome(input);
    }

    // Clear input
    setInput("");
  };

    


  return (
    <>
      <form
        className="search-box"
        onSubmit={(e) => {
          // e.preventDefault();
          handleSubmit(e);
          // onSend(input, selectedChat);
          // setInput("");
        }}
      >
        <input
          type="text"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder="Enter a prompt here..."
        />
        <div>
          <img src={assets.gallery_icon} alt="gallery icon" />
          <img src={assets.mic_icon} alt="mic icon" />
          <img
            src={assets.send_icon}
            onClick={(e) => handleSubmit(e)}
            alt="send icon"
          />
        </div>
      </form>
    </>
  );
}

export default SearchBar