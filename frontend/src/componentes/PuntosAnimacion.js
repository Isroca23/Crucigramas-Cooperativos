import React, { useEffect, useState } from 'react';

const PuntosAnimacion = ({ puntos, x, y, delay = '0s'}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div 
      className="puntos-animacion"
      style={{
        left: x,
        top: y,
        animationDelay: delay
      }}
    >
      +{puntos}
    </div>
  );
};

export default PuntosAnimacion;