import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";
import Navbar from "../components/Navbar/Navbar";

const MainLayout = () => {
  return (
    <div className="app-container">
      {/* 1. Sidebar is always visible here */}
      <Sidebar />

      {/* 2. The Dynamic Content Area */}
      <div className="main-content">
        <Navbar/>
        
        {/* <Outlet> acts as a placeholder. 
            React Router will fill this with Home, Settings, etc. */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
