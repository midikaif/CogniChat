import { useContext } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Imports
import MainLayout from "./layouts/MainLayout";
import Home from "./components/Home/Home";
import Settings from "./components/Settings/Settings";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Loader from "./components/Loader/Loader";
import { Context } from "./Context/ContextProvider";

function App() {
  const { loading } = useContext(Context);

  return (
    <>
      {loading && <Loader />}

      <Router>
        <Routes>
          {/* PARENT ROUTE: The Layout (Sidebar + Content Box) */}
          <Route path="/" element={<MainLayout />}>
            {/* CHILD 1: Home Page (Default) */}
            <Route path="/" element={<Home />}>
              <Route path="login" element={<LoginSignup />} />
              <Route path="signup" element={<LoginSignup />} />
            </Route>

            {/* CHILD 2: Settings Page */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
