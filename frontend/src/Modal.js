import React from 'react';
import './App.css';

const ModalConfirmacion = ({ mensaje, confirmar, cancelar, onConfirmar, onCancelar }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{mensaje}</p>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={onConfirmar}>
            {confirmar}
          </button>
          <button className="cancel-button" onClick={onCancelar}>
            {cancelar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;