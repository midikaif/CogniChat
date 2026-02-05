// src/components/ProtectedRoute/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../Context/ContextProvider";
import Loader from "./Loader/Loader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(Context);

  // 1. If we are still checking the API, show a loading spinner
  // (Don't redirect yet, give the server a chance to say "yes")
  if (loading) {
    return <Loader />; // Or your Spinner component
  }

  // 2. If loading is done, and user is STILL null -> KICK THEM OUT
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user exists, let them see the page
  return children;
};

export default ProtectedRoute;
