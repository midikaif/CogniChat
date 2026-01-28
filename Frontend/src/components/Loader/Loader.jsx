import React, { useCallback, useContext } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./Loader.css";
import {Context} from "../../Context/ContextProvider";

const Loader = () => {
  const {loading} = useContext(Context);

//  if (!loading) {
//    return;
//  }


  return (
    <div className="loader">
      <div className="loader-inner">
        <div className="loader-line-wrap">
          <div className="loader-line"></div>
        </div>
        <div className="loader-line-wrap">
          <div className="loader-line"></div>
        </div>
        <div className="loader-line-wrap">
          <div className="loader-line"></div>
        </div>
        <div className="loader-line-wrap">
          <div className="loader-line"></div>
        </div>
        <div className="loader-line-wrap">
          <div className="loader-line"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
