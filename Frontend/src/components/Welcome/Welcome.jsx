import { useContext } from "react";
import { Context } from "../../Context/ContextProvider";
import "./Welcome.css";
import {useNavigate} from "react-router-dom";

function Welcome() {
  const { user,chats } = useContext(Context);

  const navigate = useNavigate();

  return (
    <>
      <div className="greet">
        <p>
          <span>Hey, {user?.fullName?.firstName || "there"}.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      {chats.length>0 && (
        <div className="welcome-card">
          <div>Recent chat:</div>
          <div
            className="welcome-card-item"
            onClick={() => navigate(`c/${chats[0]._id}`)}
          >
            {chats[0].title}
          </div>
        </div>
      )}
    </>
  );
}

export default Welcome;
