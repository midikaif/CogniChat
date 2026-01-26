import {useContext} from "react";
import "./App.css";
import Home from "./components/Home/Home";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Settings from "./components/Settings/Settings";
import Sidebar from "./components/Sidebar/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Context} from "./Context/ContextProvider";
import Loader from "./components/Loader/Loader";


function App() {
  const {settings} = useContext(Context);


  return (
    <>
      {/* <Loader /> */}
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Sidebar />
                {settings ? <Settings /> : <Home />}
              </>
            }
          >
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/signup" element={<LoginSignup />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
