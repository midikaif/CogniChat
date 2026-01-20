import { useContext } from "react";
import { Context } from "../../Context/ContextProvider";
import "./Welcome.css";
import { assets } from "../../assets/assets";
import { IoMdSend } from "react-icons/io";

function Welcome() {
  const { user, startChatFromWelcome } = useContext(Context);

  return (
    <>
      <div className="greet">
        <p>
          <span>Hey, {user?.fullName.firstName || "there"}.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      <div className="suggestion-cards">
        {/* Optional: Quick start cards like Gemini/ChatGPT */}
        <div
          className="card"
          onClick={() => startChatFromWelcome("Explain React Hooks")}
        >
          <p>Explain React Hooks</p>
          <img src={assets.code_icon} alt="" />
        </div>
        <div
          className="card"
          onClick={() => startChatFromWelcome("Debug this JavaScript code")}
        >
          <p>Debug Code</p>
          <img src={assets.bulb_icon} alt="" />
        </div>
        {/* Add more cards if you want */}
      </div>

      {/* The Main Input Area */}
      {/* <form className="welcome-search-box" onSubmit={handleSubmit}>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Enter a prompt here..."
        />
        <button type="submit">
          <IoMdSend size={24} color="#5e5e5e" />
        </button> 
      </form>
        */}
    </>
  );
}

export default Welcome;
