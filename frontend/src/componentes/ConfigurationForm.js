import React from 'react';

const ConfigurationForm = ({ visible, config, onChange }) => {
  if (!visible) return null;

  return (
    <div className="config-form">
      <label>
        Filas:
        <input
          type="number"
          name="filas"
          min="5"
          max="15"
          value={config.filas}
          onChange={onChange}
        />
      </label>
      
      <label>
        Columnas:
        <input
          type="number"
          name="columnas"
          min="5"
          max="15"
          value={config.columnas}
          onChange={onChange}
        />
      </label>

      <label>
        <input
          type="checkbox"
          name="PalabrasColoquiales"
          checked={config.PalabrasColoquiales}
          onChange={onChange}
        />
        Palabras Coloquiales
      </label>

      <label>
        <input
          type="checkbox"
          name="PalabrasEnDesuso"
          checked={config.PalabrasEnDesuso}
          onChange={onChange}
        />
        Palabras en Desuso
      </label>
    </div>
  );
};

export default ConfigurationForm;