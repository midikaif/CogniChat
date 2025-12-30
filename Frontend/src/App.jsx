import {useContext} from "react";
import "./App.css";
import Home from "./components/Home/Home";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Settings from "./components/Settings/Settings";
import Sidebar from "./components/Sidebar/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Context} from "./context/ContextProvider";


function App() {
  const {settings} = useContext(Context);


  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/signup" element={<LoginSignup />} />
        <Route
          path="/"
          element={
<>
            <Sidebar />
            {settings ? <Settings/> : <Home/>}
</>          
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
