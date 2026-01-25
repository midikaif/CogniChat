import React, { useCallback, useContext } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./Loader.scss"; // Import the SCSS file
import {Context} from "../../Context/ContextProvider";

const Loader = () => {
  const {loading} = useContext(Context);

 

  // Initialization for react-tsparticles
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

 if (!loading) {
   return;
 }

  // Configuration for the Blue Particles (Inner)
  const optionsBlue = {
    fullScreen: { enable: false }, // Important: keeps particles inside the container
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: "#1B5F70" },
      shape: {
        type: "circle",
        stroke: { width: 0, color: "#000000" },
        polygon: { nb_sides: 3 },
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
      },
      size: {
        value: 10,
        random: true,
        anim: { enable: false, speed: 10, size_min: 0.1, sync: false },
      },
      line_linked: {
        enable: false,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "bounce",
        bounce: false,
        attract: { enable: false, rotateX: 394.5, rotateY: 157.8 },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: false, mode: "push" },
        resize: true,
      },
      modes: {
        grab: { distance: 200, line_linked: { opacity: 0.2 } },
        bubble: {
          distance: 1500,
          size: 40,
          duration: 7,
          opacity: 0.36,
          speed: 3,
        },
        repulse: { distance: 50, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 },
      },
    },
    retina_detect: true,
  };

  // Configuration for the White Particles (Outer)
  const optionsWhite = {
    fullScreen: { enable: false },
    particles: {
      number: { value: 250, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: {
        type: "circle",
        stroke: { width: 0, color: "#000000" },
        polygon: { nb_sides: 3 },
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: { enable: false, speed: 0.2, opacity_min: 0, sync: false },
      },
      size: {
        value: 15,
        random: true,
        anim: { enable: true, speed: 10, size_min: 0.1, sync: false },
      },
      line_linked: { enable: false },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "bounce",
        bounce: false,
        attract: { enable: true, rotateX: 3945, rotateY: 157 },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: false, mode: "grab" },
        onclick: { enable: false, mode: "push" },
        resize: true,
      },
    },
    retina_detect: true,
  };

  return (
    <div className="loader-wrapper">
      {/* The Central Rotating Loader */}
      <div className="e-loadholder">
        <div className="m-loader">
          <span className="e-text">Loading</span>
        </div>
      </div>

      {/* Blue Particle Canvas */}
      <Particles
        id="particleCanvas-Blue"
        init={particlesInit}
        options={optionsBlue}
        className="particles-blue"
        // We apply specific styles via ID in SCSS,
        // but react-tsparticles renders a canvas inside a div.
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* White Particle Canvas */}
      <Particles
        id="particleCanvas-White"
        init={particlesInit}
        options={optionsWhite}
        className="particles-white"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default Loader;
