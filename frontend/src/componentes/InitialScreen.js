import React, { useState } from 'react';
import logo from '../img/Logo.png';
import '../App.css';

const InitialScreen = ({ nombre, onNombreChange, codigoSalaInput, onCodigoChange, onCrearSala, onUnirseSala, error, setError }) => {
  const [modo, setModo] = useState(null);

  const handleVolver = () => {
    setModo(null);
    setError('');
  };

  return (
    <div className="initial-screen">
      <div className="initial-logo-container">
        <div className="initial-logo-background"></div>
        <img src={logo} alt="Logo" className="initial-logo initial-animated-logo" />
      </div>
      <h1 className="initial-animated-title">Crucigramas Cooperativos</h1>
      <div className="initial-form-container">
        {!modo && (
          <div className="initial-button-group">
            <button className="initial-primary-button" onClick={() => setModo('crear')}>Crear Sala</button>
            <button className="initial-primary-button" onClick={() => setModo('unirse')}>Unirse a Sala</button>
          </div>
        )}
        {modo === 'crear' && (
          <form className="initial-form" onSubmit={(e) => { e.preventDefault(); onCrearSala(); }}>
            <label>
              Nombre:
              <input
                type="text"
                value={nombre}
                onChange={(e) => onNombreChange(e.target.value)}
                placeholder="Introduce tu nombre"
              />
            </label>
            <label>
              Código de Sala (opcional):
              <input
                type="text"
                value={codigoSalaInput}
                onChange={(e) => onCodigoChange(e.target.value)}
                placeholder="Personaliza el código de sala"
              />
            </label>
            <div className="initial-form-buttons">
              <button type="submit" className="initial-primary-button">Crear</button>
              <button type="button" className="initial-secondary-button" onClick={handleVolver}>Volver</button>
            </div>
          </form>
        )}
        {modo === 'unirse' && (
          <form className="initial-form" onSubmit={(e) => { e.preventDefault(); onUnirseSala(); }}>
            <label>
              Nombre:
              <input
                type="text"
                value={nombre}
                onChange={(e) => onNombreChange(e.target.value)}
                placeholder="Introduce tu nombre"
              />
            </label>
            <label>
              Código de Sala:
              <input
                type="text"
                value={codigoSalaInput}
                onChange={(e) => onCodigoChange(e.target.value)}
                placeholder="Introduce el código de sala"
              />
            </label>
            <div className="initial-form-buttons">
              <button type="submit" className="initial-primary-button">Unirse</button>
              <button type="button" className="initial-secondary-button" onClick={handleVolver}>Volver</button>
            </div>
          </form>
        )}
        {error && <p className="initial-error-message">{error}</p>}
      </div>
    </div>
  );
};

export default InitialScreen;