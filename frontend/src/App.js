import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import io from 'socket.io-client';
import logo from './img/Logo.png';
import { ReactComponent as GroupAddIcon } from './img/GroupAddRounded.svg';
import { ReactComponent as GroupIcon } from './img/GroupRounded.svg';
import { ReactComponent as ExitIcon } from './img/ExitBold.svg';

// Inicializar conexión con el servidor de socket
const socket = io('http://localhost:5000');

function App() {
  const [screen, setScreen] = useState('initial'); // Manejar la pantalla actual
  const [codigoSala, setCodigoSala] = useState(''); // Almacenar el código de la sala
  const [codigoSalaInput, setCodigoSalaInput] = useState(''); // Almacenar el input del código de sala
  const [nombre, setNombre] = useState(''); // Almacenar el nombre del jugador
  const [error, setError] = useState(''); // Almacenar mensajes de error
  const [crucigrama, setCrucigrama] = useState(null); // Almacenar el crucigrama generado
  const [pestanaActiva, setPestanaActiva] = useState('palabras'); // Manejar la pestaña activa
  const [jugadores, setJugadores] = useState([]); // Almacenar la lista de jugadores
  const [isLoading, setIsLoading] = useState(false); // Manejar el estado de carga

  useEffect(() => {
    // Escuchar eventos de actualización de jugadores
    socket.on('jugadoresActualizados', (jugadoresActualizados) => {
      setJugadores(jugadoresActualizados);
    });

    // Manejar errores de conexión
    socket.on('connect_error', () => {
      setError('Error de conexión con el servidor.');
    });

    // Limpiar eventos al desmontar el componente
    return () => {
      socket.off('jugadoresActualizados');
      socket.off('connect_error');
    };
  }, []);

  const generarCrucigrama = async () => {
    setIsLoading(true); // Activar el estado de carga
    try {
      const response = await axios.get('/api/generar-crucigrama'); // Solicitar crucigrama al backend
      setCrucigrama(response.data); // Almacenar el crucigrama recibido
    } catch (error) {
      console.error('Error al generar crucigrama:', error); // Manejar errores
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  const crearSala = () => {
    if (!nombre) {
      setError('Por favor, introduce tu nombre.'); // Validar que el nombre no esté vacío
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
              <button onClick={generarCrucigrama} disabled={isLoading}>
                {isLoading ? 'Generando...' : 'Generar Crucigrama'}
              </button>
              {isLoading && <p>Cargando crucigrama, por favor espera...</p>}
              {crucigrama && (
                <div>
                  <h2>Crucigrama Generado</h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${crucigrama.tablero[0].length}, 1fr)`,
                      gap: '5px',
                    }}
                  >
                    {crucigrama.tablero.map((fila, filaIndex) =>
                      fila.map((casilla, columnaIndex) => (
                        <div
                          key={`${filaIndex}-${columnaIndex}`}
                          style={{
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: casilla === '#' ? '#9F9890' : '#EDEDE9', // Sin fondo para casillas vacías
                          }}
                        >
                          {casilla === '#' ? ' ' : casilla} {/* Mostrar vacío para casillas null */}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
                {pestanaActiva === 'palabras' && (
                  <div>
                    <h3>Definiciones</h3>
                    {crucigrama && crucigrama.pistas.map((pista, index) => (
                      <div key={index}>
                        <strong>{index + 1}.</strong> {pista.definicion}
                      </div>
                    ))}
                  </div>
                )}
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