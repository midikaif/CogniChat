import { useContext } from "react";
import { Context } from "../../Context/ContextProvider";
import { assets } from "../../assets/assets";
import "./RecentChats.css";
import { MdDelete } from "react-icons/md";

function RecentChats({ chats, onDeleteChat }) {
  const {
    selectedChat,
    setSelectedChat,
    setExtended,
  } = useContext(Context);


  return (
    <>
      {chats.map((chat, index) => (
        <div
          className={`recent-entry-container${
            selectedChat === chat._id ? " selected" : ""
          }`}
          key={index}
          onClick={() => {
            setExtended(true);
            if (selectedChat === chat._id) {
              setSelectedChat(null);
              return;
            }
            setSelectedChat(chat._id);
          }}
        >
          <div className={`recent-entry`}>
            <img src={assets.message_icon} alt="message icon" />
            <p>{chat.title}</p>
          </div>
          <div className="chat-delete" onClick={(e) => onDeleteChat(e, chat._id)}>
            <MdDelete opacity={"0.5"} cursor={"pointer"} />
          </div>
        </div>
      ))}
    </>
  );
}

export default RecentChats;
