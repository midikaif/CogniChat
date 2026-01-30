import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LoginSignup.css";
import { FaUserAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import api from "../../apis/api";
import { Context } from "../../Context/ContextProvider";

function LoginSignup() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setUser,
    setNotification,
    notification,
    showNotification,
    setLoading,
    loading,
  } = useContext(Context);

  const getActionFromPath = (pathname) => {
    if (pathname === "/login") return "login";
    return "sign up";
  };

  const [action, setAction] = useState(getActionFromPath(location.pathname));

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: {
      firstName: "",
      lastName: "",
    },
    email: "",
    password: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;

    if (notification) setNotification("");

    if (name === "firstName" || name === "lastName") {
      setForm({
        ...form,
        fullName: {
          ...form.fullName,
          [name]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setLoading(true);
    // if(!e.target.checkValidity()){
    //   return;
    // }

    api
      .post(`/api/auth${location.pathname}`, form)
      .then((response) => {
        console.log("logged in", response);
        setUser(response.data.user || "");
        setLoading(false);
        navigate("/");

        // Handle successful response
      })
      .catch((error) => {
        setNotification(error.response?.data?.message || "An error occurred");
        console.error("Error:", error);
        // Handle error response
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/guest");

      if (data.success) {
        setUser(data.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Guest login failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to switch modes easily
  const toggleMode = () => {
    if (action === "login") {
      navigate("/signup");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    setAction(getActionFromPath(location.pathname));
    setIsSubmitted(false);
    setNotification("");
  }, [location.pathname, setNotification]);

  if (loading) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="container">
        {notification && showNotification()}
        <div className="header">
          <div className="text">
            {action === "login" ? "Welcome Back" : "Create Account"}
          </div>
          <div className="underline"></div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className={isSubmitted ? "was-submitted" : ""}
        >
          <div className="inputs">
            {action === "sign up" && (
              <div className="name-row">
                {/* 2. First Name Box */}
                <div className="input">
                  <FaUserAlt className="icon" />
                  <input
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    required
                    value={form.fullName.firstName}
                    onChange={handleInput}
                  />
                </div>

                {/* 3. Last Name Box */}
                <div className="input">
                  <FaUserAlt className="icon" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    required
                    value={form.fullName.lastName}
                    onChange={handleInput}
                  />
                </div>
                <span className="error-message">First name required</span>
              </div>
            )}
            <div className="input">
              <MdEmail className="icon" />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                value={form.email}
                onChange={handleInput}
              />
              <div className="error-message">Please enter a valid email</div>
            </div>
            <div className="input">
              <RiLockPasswordLine className="icon" />
              <input
                type="password"
                placeholder="Password"
                name="password"
                required
                minLength={action === "sign up" ? 6 : undefined}
                value={form.password}
                onChange={handleInput}
              />
              <span className="error-message">
                {action === "sign up"
                  ? "Password must be at least 6 characters"
                  : "Password required"}
              </span>
            </div>
          </div>

          <button type="submit" className="main-submit-btn">
            {action === "login" ? "Login" : "Sign Up"}
          </button>

          <div
            style={{
              marginTop: "15px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="button" // Important: preventing form submit
              onClick={handleGuestLogin}
              className="guest-btn"
            >
              Continue as Guest
            </button>
          </div>

          <div className="switch-text">
            {action === "login" ? "Not signed up?" : "Already have an account?"}
            <span onClick={toggleMode}>
              {action === "login" ? "Sign up now" : "Login here"}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginSignup;
