import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { parse } from "marked";
import "./Chats.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/ContextProvider";
import { RiRobot2Line } from "react-icons/ri";
import hljs from "highlight.js";

// 2. Import the Look (The Theme)
// You can change 'atom-one-dark' to 'github', 'dracula', or 'vs2015'
import "highlight.js/styles/atom-one-dark.css";

function Chats({ selectedChat }) {
  const {
    loadingReply,
    prevPrompts,
    setPrevPrompts,
    isCreatingChat,
    loadChat,
   
  } = useContext(Context);

  const [fetching, setFetching] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      if (isCreatingChat) return;

      if (prevPrompts.length > 0 && prevPrompts[0].chat === selectedChat) {
        return;
      }

      setFetching(true);
      loadChat(selectedChat);
      setFetching(false);
    }
  }, [selectedChat, setPrevPrompts, isCreatingChat]);

  useEffect(() => {
    const timer = setTimeout(()=>{
      hljs.highlightAll();
    }, 10);
    return () => clearTimeout(timer);
  }, [prevPrompts]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedChat, prevPrompts.length, loadingReply]);


const chatMessages = useMemo(() => {
  return (
    <>
      {prevPrompts.length > 0 &&
        prevPrompts.map((prompt, index) => (
          <div
            key={index}
            ref={prevPrompts.length - 1 === index ? bottomRef : null}
          >
            {prompt.role === "user" && (
              <div className="user">
                <img src={assets.user_icon} alt="user icon" />
                <p className="user-message-box">{prompt.content}</p>
              </div>
            )}
            {prompt.role === "model" && (
              <div className="ai">
                <div className="ai-icon-container">
                  <RiRobot2Line size={24} color="#5e5e5e" />
                </div>
                {/* <img src={assets.gemini_generated1}  alt="gemini icon" /> */}
                <div
                  className="ai-message-box"
                  dangerouslySetInnerHTML={{ __html: parse(prompt.content) }}
                ></div>
              </div>
            )}
            {prevPrompts.length - 1 === index && loadingReply && (
              <div className="ai">
                <div className="ai-icon-container">
                  <RiRobot2Line size={24} color="#5e5e5e" />
                </div>
                {/* <img src={assets.gemini_icon} alt="gemini icon" /> */}
                <div className="ai-loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              </div>
            )}
          </div>
        ))}
    </>
  );
}, [prevPrompts, loadingReply]);

  if (fetching) {
    return (
      <div
        className="loader-container"
        style={{ padding: "50px", width: "100%" }}
      >
        <div className="loader">
          <hr style={{ width: "100%" }} />
          <hr style={{ width: "80%" }} />
          <hr style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  return (<>{chatMessages}</>);

}

export default Chats;
