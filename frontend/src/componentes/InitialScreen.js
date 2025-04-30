import React from 'react';

const InitialScreen = ({ nombre, onNombreChange, codigoSalaInput, onCodigoChange, onCrearSala, onUnirseSala, error }) => {
  return (
    <div className="initial-screen">
      <input
        type="text"
        value={nombre}
        onChange={(e) => onNombreChange(e.target.value)}
        placeholder="Tu Nombre"
      />
      <button onClick={onCrearSala}>Crear Sala</button>
      <input
        type="text"
        value={codigoSalaInput}
        onChange={(e) => onCodigoChange(e.target.value)}
        placeholder="Código de Sala"
      />
      <button onClick={onUnirseSala}>Unirse a Sala</button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default InitialScreen;