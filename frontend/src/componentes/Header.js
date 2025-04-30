import React from 'react';
import logo from '../img/Logo.png';
import { ReactComponent as GroupIcon } from '../img/GroupRounded.svg';
import { ReactComponent as ExitIcon } from '../img/ExitBold.svg';

const Header = ({ onExit }) => {
  return (
    <div className="header-bar">
      <button className="header-left" onClick={onExit}>
        <div className="logo-circle"></div>
        <img src={logo} alt="Logo" className="logo" />
      </button>
      <div className="header-center">
        <h1><strong>Crucigramas Cooperativos</strong></h1>
      </div>
      <div className="header-right">
        <button className="icon-button">
          <GroupIcon className="icon" />
        </button>
        <button className="icon-button" onClick={onExit}>
          <ExitIcon className="icon" />
        </button>
      </div>
    </div>
  );
};

export default Header;