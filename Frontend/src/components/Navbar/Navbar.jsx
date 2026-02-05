import { useState, useContext } from "react";
import { Context } from "../../Context/ContextProvider";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import { assets } from "../../assets/assets";
import "./Navbar.css";

function Navbar() {
  const { setSelectedChat, setUser, setExtended } = useContext(Context);
  const [showSignout, setShowSignout] = useState(false);
  const navigate = useNavigate();

  const handleSignout = async () => {
      console.log('Signing out');
      setShowSignout(false);

    try {
      await api.post("/api/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="nav">
      <img
        src={assets.menu_icon}
        className="nav-menu-icon"
        onClick={() => setExtended(true)}
        alt="Menu"
      />

      {/* 1. Logo Text */}
      <p className="nav-logo" onClick={() => setSelectedChat(null)}>
        CogniChat
      </p>

      {/* 2. User Section */}
      <div className="nav-user-container">
        <img
          className="user-icon"
          src={assets.user_icon}
          alt="user icon"
          onClick={() => setShowSignout((prev) => !prev)}
        />

        {/* 3. The Minimalist Dropdown */}
        {showSignout && (
          <div className="profile-dropdown">
            <p className="dropdown-text">Sign out?</p>
            <button className="signout-btn" onClick={handleSignout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
