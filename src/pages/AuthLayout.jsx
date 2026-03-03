import React, { useState, useEffect } from "react";
import "../styles/AuthStyles.css";

const AuthLayout = ({ children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Slow down the movement for a "heavy" parallax feel
      setMousePos({ x: e.clientX / 400, y: e.clientY / 400 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="auth-page-container">
      {/* Interactive Stars */}
      <div 
        className="star-layer" 
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        {/* Simple CSS Stars */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '2px', height: '2px',
            background: 'white',
            boxShadow: '0 0 5px #fff'
          }} />
        ))}
      </div>

      <div className="scene">

  {/* 🚗 Background car animation */}
  <div className="car-container">
    <div className="car-cabin"></div>

    <div className="car-body">
      <div className="door-1"></div>
      <div className="door-2"></div>
    </div>

    <div className="wheel back"></div>
    <div className="wheel front"></div>
  </div>

  <div className="road"></div>
  <div className="ground-grid"></div>      
  {/* 🧾 FORM OVERLAY — separate layer */}
  <div className="form-overlay">
    {children}
  </div>

</div>
  </div>
  );
};

export default AuthLayout;