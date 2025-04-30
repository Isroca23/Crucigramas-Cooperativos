import React from 'react';

const TabsContainer = ({ pestanaActiva, onTabChange, definicionSeleccionada }) => {
  return (
    <div className="tabs-container">
      <div className="tabs">
        <button
          className={pestanaActiva === 'palabras' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('palabras')}
        >
          Palabras
        </button>
        <button
          className={pestanaActiva === 'chat' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('chat')}
        >
          Chat
        </button>
        <button
          className={pestanaActiva === 'estadisticas' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('estadisticas')}
        >
          Estadísticas
        </button>
      </div>

      <div className="tab-content">
        {pestanaActiva === 'palabras' && (
          <div>
            {definicionSeleccionada ? (
              <div>
                <strong>Definiciones:</strong>
                <ol className="definition-list">
                  {definicionSeleccionada.map((definicion, index) => (
                    <li key={index}>{definicion}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <p>Selecciona una palabra para ver sus definiciones.</p>
            )}
          </div>
        )}
        {pestanaActiva === 'chat' && <p>Aquí estará el chat.</p>}
        {pestanaActiva === 'estadisticas' && <p>Aquí se mostrarán las estadísticas.</p>}
      </div>
    </div>
  );
};

export default TabsContainer;