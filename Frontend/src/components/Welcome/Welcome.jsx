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
          <span>Hey, {user?.fullName?.firstName || "there"}.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      {/* <div className="suggestion-cards">
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
      
      </div> */}

    </>
  );
}

export default Welcome;
