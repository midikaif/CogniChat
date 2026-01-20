import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LoginSignup.css";
import { FaUserAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import api from "../../apis/api";
import { Context } from "../../context/ContextProvider";

function LoginSignup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setNotification, notification, showNotification, setLoading } = useContext(Context);

  // Determine initial action from path

  // useEffect(() => {
  //   const cookies = Cookies.get("token");
  //   const path = location.pathname;

  //   if (cookies && (path === "/login" || path === "/signup")) {
  //     navigate("/", { replace: true });
  //   }
  // }, [location.pathname, navigate]);

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

  if(!e.target.checkValidity()){
    return;
  }

    api.post(`/api/auth${location.pathname}`, form)
      .then((response) => {
        console.log("logged in", response);
        setUser(response.data.user);
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
      })

  };

  useEffect(() => {
    setAction(getActionFromPath(location.pathname));
    setIsSubmitted(false);
    setNotification("");
  }, [location.pathname, setNotification]);

  return (
    <div className="container">
      {notification && showNotification()}
      <div className="header">
        <div className="text">
          {action.charAt(0).toUpperCase() + action.slice(1)}
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
            <div className="input name">
              <FaUserAlt className="icon" />
              <input
                type="text"
                placeholder="First Name"
                name="firstName"
                required
                value={form.fullName.firstName}
                onChange={handleInput}
              />
              <span className="error-message">First name required</span>
              <input
                type="text"
                placeholder="Last Name"
                name="lastName"
                required
                value={form.fullName.lastName}
                onChange={handleInput}
              />
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
        <div className="submit-container">
          <button
            type="button"
            className={action === "sign up" ? "submit" : "submit inactive"}
            onClick={() =>
              action === "sign up"
                ? document.forms[0].requestSubmit()
                : navigate("/signup")
            }
          >
            Sign Up
          </button>
          <button
            className={action === "login" ? "submit" : "submit inactive"}
            key={1}
            type="button"
            onClick={(e) => {
              if (action !== "login") {
                navigate("/login");
              } else {
                handleSubmit(e);
              }
            }}
          >
            Log in
          </button>
          <button type="submit" style={{ display: "none" }} />
        </div>
      </form>
    </div>
  );
}

export default LoginSignup;
