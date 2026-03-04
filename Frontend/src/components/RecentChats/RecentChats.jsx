import { useContext } from "react";
import { Context } from "../../Context/ContextProvider";
import { assets } from "../../assets/assets";
import "./RecentChats.css";
import { MdDelete } from "react-icons/md";
import {useNavigate} from "react-router-dom";

function RecentChats({ chats, onDeleteChat }) {
  const {
    selectedChat,
    setSelectedChat,
    setExtended,
    deleteChat
  } = useContext(Context);

  const navigate = useNavigate();

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
              navigate("/");
              setSelectedChat(null);
              return;
            }
            navigate(`/c/${chat._id}`);
            setSelectedChat(chat._id);
          }}
        >
          <div className={`recent-entry`}>
            <img src={assets.message_icon} alt="message icon" />
            <p>{chat.title}</p>
          </div>
          <div className="chat-delete" onClick={(e) => {
            deleteChat(e, chat._id);
            navigate("/");
            }}>
            <MdDelete opacity={"0.5"} cursor={"pointer"} />
          </div>
        </div>
      ))}
    </>
  );
}

export default RecentChats;
