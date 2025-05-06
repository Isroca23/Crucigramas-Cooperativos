import React from 'react';
import '../App.css';

const ModalConfirmacion = ({ mensaje, confirmar, cancelar, onConfirmar, onCancelar, acciones }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{mensaje}</p>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={onConfirmar}>
            {confirmar}
          </button>
          {acciones && acciones.map((accion, index) => (
            <button 
              key={index} 
              className="action-button"
              onClick={accion.onClick}
            >
              {accion.texto}
            </button>
          ))}
          <button className="cancel-button" onClick={onCancelar}>
            {cancelar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;