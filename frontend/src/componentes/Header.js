import React from 'react';
import logo from '../img/Logo.png';
import { ReactComponent as GroupIcon } from '../img/GroupRounded.svg';
import { ReactComponent as ExitIcon } from '../img/ExitBold.svg';
import ClickableButton from './ClickableButton';

const Header = ({ onExit, jugadores, socketId }) => {
  
  return (
    <div className="header-bar">
      <button className="header-left" onClick={onExit}>
        <img src={logo} alt="Logo" className="logo" />
      </button>
      <div className="header-center">
        <h1><strong>Crucigramas Cooperativos</strong></h1>
      </div>
      <div className="header-right">
        <ClickableButton className="users-dropdown">
          <GroupIcon className="icon" />
          <div className="users-menu">
            <h3><b>Jugadores conectados:</b></h3>
            <ul>
              {jugadores.map(jugador => (
                <li key={jugador.id}>
                  {jugador.nombre}
                  {jugador.id === socketId && <span className="tag-you">(Tú)</span>} <p>({jugador.id})</p></li>
              ))}
            </ul>
          </div>
        </ClickableButton>
        <button className="icon-button" onClick={onExit}>
          <ExitIcon className="icon" />
        </button>
      </div>
    </div>
  );
};

export default Header;