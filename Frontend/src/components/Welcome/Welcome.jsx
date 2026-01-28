import { useContext } from "react";
import { Context } from "../../Context/ContextProvider";
import "./Welcome.css";

function Welcome() {
  const { user } = useContext(Context);

  return (
    <>
      <div className="greet">
        <p>
          <span>Hey, {user?.fullName?.firstName || "there"}.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
    </>
  );
}

export default Welcome;
