import React, { useState } from 'react';
import { ReactComponent as LoadingIcon } from '../img/Loading.svg';
import { ReactComponent as SettingsIcon } from '../img/Settings.svg';
import ConfigurationForm from './ConfigurationForm';

const CrosswordContainer = ({
  tableroVisible,
  tableroRespuestas,
  isLoading,
  esAnfitrion,
  casillaSeleccionada,
  orientacion,
  animaciones,
  palabraSeleccionada,
  configuracionCrucigrama,
  onGenerarCrucigrama,
  onConfiguracionChange,
  onCasillaClick,
  onCasillaChange,
  setAnimaciones,
  intentarSeleccionarPalabra,
  setCasillaSeleccionada,
  onVerificarCasilla,
  onVerificarPalabra,
  onVerificarTablero,
  children
}) => {
  const [formVisible, setFormVisible] = useState(false);

  return (
    <div className="crossword-container">
      {children}
      
      <div className={`buttons-container ${!tableroVisible && !isLoading ? 'centered' : ''}`}>
        {esAnfitrion && (
          <div>
            <button
              onClick={onGenerarCrucigrama}
              disabled={isLoading}
              className="generate-button"
            >
              {isLoading ? (
                <LoadingIcon className="loading-icon" />
              ) : (
                <>
                  Generar Crucigrama
                  <div
                    className="settings-icon-container"
                    onMouseEnter={() => setFormVisible(true)}
                    onMouseLeave={() => setFormVisible(false)}
                  >
                    <SettingsIcon className="settings-icon" />
                    <ConfigurationForm
                      visible={formVisible}
                      config={configuracionCrucigrama}
                      onChange={onConfiguracionChange}
                    />
                  </div>
                </>
              )}
            </button>
          </div>
        )}

        {tableroVisible && (
          <div className="verify-buttons">
            <button onClick={onVerificarCasilla}>Verificar Casilla</button>
            <button onClick={onVerificarPalabra}>Verificar Palabra</button>
            <button onClick={onVerificarTablero}>Verificar Tablero</button>
          </div>
        )}
      </div>

      {tableroVisible && (
        <p className="help-text">
          Usa las flechas para moverte entre casillas y Tab para cambiar la orientación.
        </p>
      )}
    </div>
  );
};

export default CrosswordContainer;