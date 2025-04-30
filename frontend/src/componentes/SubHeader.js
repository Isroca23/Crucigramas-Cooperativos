import React from 'react';
import { ReactComponent as CopyIcon } from '../img/Copy.svg';
import { ReactComponent as CopiedIcon } from '../img/CopyChecked.svg';

const SubHeader = ({ nombre, codigoSala, showCopiedIcon, onCopy }) => {
  return (
    <div className="sub-header">
      <span><strong>Jugador:</strong> {nombre}</span>
      <span className="copy-code" onClick={onCopy}>
        <span className="copy-icon-wrapper">
          {!showCopiedIcon ? <CopyIcon /> : <CopiedIcon />}
        </span>
        <strong>ID Sala:</strong> {codigoSala}
      </span>
    </div>
  );
};

export default SubHeader;