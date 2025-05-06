import React from 'react';
import Estadisticas from './Estadisticas.js';
import Definiciones from './Definiciones.js';

const TabsContainer = ({ pestanaActiva, onTabChange, definicionSeleccionada, estadisticas, jugadores, socketId, onSeleccionarPalabra }) => {
  return (
    <div className="tabs-container">
      <div className="tabs">
        <button
          className={pestanaActiva === 'definiciones' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('definiciones')}
        >
          Definiciones
        </button>
        <button
          className={pestanaActiva === 'estadisticas' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('estadisticas')}
        >
          Estadísticas
        </button>
      </div>

      <div className="tab-content">
        {pestanaActiva === 'definiciones' && (
          <Definiciones definicionSeleccionada={definicionSeleccionada} />
        )}
        {pestanaActiva === 'estadisticas' && (
          <Estadisticas 
            estadisticas={estadisticas} 
            jugadores={jugadores} 
            socketId={socketId} 
            onSeleccionarPalabra={onSeleccionarPalabra}
          />
        )}
      </div>
    </div>
  );
};

export default TabsContainer;