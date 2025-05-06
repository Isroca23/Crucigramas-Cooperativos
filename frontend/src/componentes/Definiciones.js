import React from 'react';

const Definiciones = ({ definicionSeleccionada }) => {
  return (
    <div className="definition-container">
      <div className="definition-header">
        <h2>Definiciones de la palabra seleccionada</h2>
    </div>
      {definicionSeleccionada ? (
        <div>
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
  );
};

export default Definiciones;