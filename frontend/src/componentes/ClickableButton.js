import React, { useState, useEffect } from 'react';
import '../App.css';

const ClickableButton = ({ children, className = '', ...props }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isHoverSupported, setIsHoverSupported] = useState(true);

  useEffect(() => {
    // Detectar si el dispositivo soporta hover
    const hoverQuery = window.matchMedia('(hover: none)');
    setIsHoverSupported(!hoverQuery.matches);

    const handleHoverChange = (e) => {
      setIsHoverSupported(!e.matches);
    };

    hoverQuery.addEventListener('change', handleHoverChange);
    return () => hoverQuery.removeEventListener('change', handleHoverChange);
  }, []);

  const handleClick = () => {
    if (!isHoverSupported) {
      setIsClicked(!isClicked);
    }
  };

  return (
    <button
      className={`${className} ${isClicked ? `${className} clicked` : ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ClickableButton;