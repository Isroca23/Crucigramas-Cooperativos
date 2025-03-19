import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import logo from './img/Logo.png';
import { ReactComponent as GroupAddIcon } from './img/GroupAddRounded.svg';
import { ReactComponent as GroupIcon } from './img/GroupRounded.svg';
import { ReactComponent as ExitIcon } from './img/ExitBold.svg';

const socket = io('http://localhost:5000');

function App() {
  const [screen, setScreen] = useState('initial');
  const [codigoSala, setCodigoSala] = useState('');
  const [codigoSalaInput, setCodigoSalaInput] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('palabras');

  useEffect(() => {
    socket.on('jugadoresActualizados', (jugadoresActualizados) => {
      setJugadores(jugadoresActualizados);
    });

    socket.on('connect_error', () => {
      setError('Error de conexión con el servidor.');
    });

    return () => {
      socket.off('jugadoresActualizados');
      socket.off('connect_error');
    };
  }, []);

  const crearSala = () => {
    if (!nombre) {
      setError('Por favor, introduce tu nombre.');
      return;
    }

    socket.emit('crearSala', { nombre, codigoSalaInput }, (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        setCodigoSala(response.codigoSala);
        setJugadores([response.jugador]);
        setScreen('sala');
      }
    });
  };

  const unirseSala = () => {
    if (!codigoSalaInput) {
      setError('Por favor, introduce un código de sala.');
      return;
    }
    if (!nombre) {
      setError('Por favor, introduce tu nombre.');
      return;
    }

    socket.emit('unirseSala', { codigoSala: codigoSalaInput, nombre }, (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        setCodigoSala(codigoSalaInput);
        setScreen('sala');
      }
    });
  };

  const salirSala = () => {
    socket.emit('salirSala', { codigoSala, nombre });
    setScreen('initial');
    setCodigoSala('');
    setCodigoSalaInput('');
    setNombre('');
    setError('');
    setJugadores([]);
  };

  return (
    <div className="App">
      {screen === 'initial' && (
        <div className="initial-screen">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu Nombre"
          />
          <button onClick={crearSala}>Crear Sala</button>
          <input
            type="text"
            value={codigoSalaInput}
            onChange={(e) => setCodigoSalaInput(e.target.value)}
            placeholder="Código de Sala"
          />
          <button onClick={unirseSala}>Unirse a Sala</button>
          {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
        </div>
      )}

      {screen === 'sala' && (
        <>
          {/* Header */}
          <div className="header-bar">
            <div className="header-left">
              <div className="logo-circle"></div>
              <img src={logo} alt="Logo" className="logo" />
            </div>
            <div className="header-center">
              <h1><strong>Crucigramas Cooperativos</strong></h1>
            </div>
            <div className="header-right">
              {/* Icono para invitar jugadores */}
              <button className="icon-button" onClick={() => {/* Lógica para invitar jugadores */}}>
                <GroupAddIcon className="icon" />
              </button>

              {/* Icono para ver jugadores */}
              <button className="icon-button" onClick={() => {/* Lógica para ver jugadores */}}>
                <GroupIcon className="icon" />
              </button>

              {/* Icono para salir de la sala */}
              <button className="icon-button" onClick={salirSala}>
                <ExitIcon className="icon" />
              </button>
            </div>
          </div>

          {/* Sub-header */}
          <div className="sub-header">
            <span>Jugador: <strong>{nombre}</strong></span>
            <span>ID Sala: <strong>{codigoSala}</strong></span>
          </div>

          {/* Contenedores principales */}
          <div className="main-content">
            <div className="crossword-container">
              <p>Aquí se generará el crucigrama</p>
            </div>

            <div className="tabs-container">
              <div className="tabs">
                <button
                  className={pestanaActiva === 'palabras' ? 'tab active' : 'tab'}
                  onClick={() => setPestanaActiva('palabras')}
                >
                  Palabras
                </button>
                <button
                  className={pestanaActiva === 'chat' ? 'tab active' : 'tab'}
                  onClick={() => setPestanaActiva('chat')}
                >
                  Chat
                </button>
                <button
                  className={pestanaActiva === 'estadisticas' ? 'tab active' : 'tab'}
                  onClick={() => setPestanaActiva('estadisticas')}
                >
                  Estadísticas
                </button>
              </div>

              <div className="tab-content">
                {pestanaActiva === 'palabras' && <p>Aquí se mostrarán las palabras.</p>}
                {pestanaActiva === 'chat' && <p>Aquí estará el chat.</p>}
                {pestanaActiva === 'estadisticas' && <p>Aquí se mostrarán las estadísticas.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;