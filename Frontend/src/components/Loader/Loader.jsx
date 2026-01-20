import React, { useContext } from "react";
import "./Loader.css";
import { Context } from "../../Context/ContextProvider";

function Loader() {
  const { loading } = useContext(Context);

  if(!loading){
    return;
  }

  return <div className="loader-overlay">
    Loading...
  </div>;
}

export default Loader;
