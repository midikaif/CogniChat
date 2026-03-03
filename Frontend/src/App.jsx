import { useContext } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Imports
import MainLayout from "./layouts/MainLayout";
import Home from "./components/Home/Home";
import Settings from "./components/Settings/Settings";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Loader from "./components/Loader/Loader";
import { Context } from "./Context/ContextProvider";
import Chats from "./components/Chats/Chats";

function App() {
  const { loading, user} = useContext(Context);

  return (
    <>
      {loading && <Loader />}

      <Router>
        <Routes>
          {/* PARENT ROUTE: The Layout (Sidebar + Content Box) */}
          <Route path="/" element={<MainLayout />}>
            {/* CHILD 1: Home Page (Default) */}
            <Route path="/" element={<Home />}>
              <Route index element={!user ? <Navigate to="/login" /> : null} />
              <Route path="login" element={<LoginSignup />} />
              <Route path="signup" element={<LoginSignup />} />
            </Route>

            {/* CHILD 2: Settings Page */}
            <Route path="settings" element={<Settings />} />

            {/* CHILD 3: Specific Chat Route */}
            <Route path="c/:chatId" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
