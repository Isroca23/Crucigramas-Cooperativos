import React, { useState, useEffect } from 'react';
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
  const [casillaSeleccionada, setCasillaSeleccionada] = useState({ fila: 0, columna: 0 }); // Casilla seleccionada
  const [orientacion, setOrientacion] = useState('horizontal'); // Orientación de la palabra seleccionada

  useEffect(() => {
    // Escuchar eventos de actualización de jugadores
    socket.on('jugadoresActualizados', (jugadoresActualizados) => {
      setJugadores(jugadoresActualizados);
    });

    // Escuchar evento de crucigrama generado
    socket.on('crucigramaGenerado', (crucigramaGenerado) => {
      setCrucigrama(crucigramaGenerado);
    });

    // Manejar errores de conexión
    socket.on('connect_error', () => {
      setError('Error de conexión con el servidor.');
    });

    // Limpiar eventos al desmontar el componente
    return () => {
      socket.off('jugadoresActualizados');
      socket.off('crucigramaGenerado');
      socket.off('connect_error');
    };
  }, []);

  const generarCrucigrama = () => {
    setIsLoading(true); // Activar el estado de carga
    socket.emit('generarCrucigrama', { codigoSala }, (response) => {
      setIsLoading(false); // Desactivar el estado de carga
      if (response.error) {
        setError(response.error);
      } else {
        setCrucigrama(response.crucigrama);
      }
    });
  };

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
        setCrucigrama(response.crucigrama);
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
        setJugadores((prev) => [...prev, response.jugador]);
        setCrucigrama(response.crucigrama);
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
    setCrucigrama(null);
  };

  const esAnfitrion = jugadores.length > 0 && jugadores[0].id === socket.id;

  // Función para verificar si hay una palabra horizontal en una casilla
  const tienePalabraHorizontal = (fila, columna, tablero) => {
    let inicio = columna;
    while (inicio > 0 && tablero[fila][inicio - 1] !== '#') inicio--;
    let fin = columna;
    while (fin < tablero[fila].length && tablero[fila][fin] !== '#') fin++;
    return fin - inicio > 1; // Hay una palabra si la longitud es mayor a 1
  };

  // Función para verificar si hay una palabra vertical en una casilla
  const tienePalabraVertical = (fila, columna, tablero) => {
    let inicio = fila;
    while (inicio > 0 && tablero[inicio - 1][columna] !== '#') inicio--;
    let fin = fila;
    while (fin < tablero.length && tablero[fin][columna] !== '#') fin++;
    return fin - inicio > 1; // Hay una palabra si la longitud es mayor a 1
  };

  const handleCasillaClick = (fila, columna) => {
    const casilla = crucigrama.tablero[fila][columna];
    if (casilla === '#') return; // No permitir seleccionar casillas negras

    const horizontal = tienePalabraHorizontal(fila, columna, crucigrama.tablero);
    const vertical = tienePalabraVertical(fila, columna, crucigrama.tablero);

    if (casillaSeleccionada.fila === fila && casillaSeleccionada.columna === columna) {
      // Cambiar orientación solo si hay palabras en ambas orientaciones
      if (horizontal && vertical) {
        setOrientacion((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
      }
    } else {
      // Seleccionar nueva casilla y establecer orientación por defecto
      setCasillaSeleccionada({ fila, columna });
      setOrientacion(horizontal ? 'horizontal' : 'vertical');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Evitar el comportamiento predeterminado del tab
      const { fila, columna } = casillaSeleccionada;
      const horizontal = tienePalabraHorizontal(fila, columna, crucigrama.tablero);
      const vertical = tienePalabraVertical(fila, columna, crucigrama.tablero);
      if (horizontal && vertical) {
        setOrientacion((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
      }
    }
  };

  const obtenerPalabraSeleccionada = () => {
    if (!crucigrama) return [];
    const { fila, columna } = casillaSeleccionada;
    let palabra = [];
    if (orientacion === 'horizontal') {
      // Obtener palabra horizontal
      let inicio = columna;
      while (inicio > 0 && crucigrama.tablero[fila][inicio - 1] !== '#') inicio--;
      let fin = columna;
      while (fin < crucigrama.tablero[fila].length && crucigrama.tablero[fila][fin] !== '#') fin++;
      palabra = crucigrama.tablero[fila].slice(inicio, fin).map((_, index) => ({
        fila,
        columna: inicio + index,
      }));
    } else {
      // Obtener palabra vertical
      let inicio = fila;
      while (inicio > 0 && crucigrama.tablero[inicio - 1][columna] !== '#') inicio--;
      let fin = fila;
      while (fin < crucigrama.tablero.length && crucigrama.tablero[fin][columna] !== '#') fin++;
      palabra = crucigrama.tablero.slice(inicio, fin).map((_, index) => ({
        fila: inicio + index,
        columna,
      }));
    }
    return palabra;
  };

  const palabraSeleccionada = obtenerPalabraSeleccionada();

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex={0}>
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
              {esAnfitrion && (
                <button onClick={generarCrucigrama} disabled={isLoading}>
                  {isLoading ? 'Generando...' : 'Generar Crucigrama'}
                </button>
              )}
              {isLoading && <p>Cargando crucigrama, por favor espera...</p>}
              {crucigrama && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${crucigrama.tablero[0].length}, 1fr)`,
                    gap: '5px',
                  }}
                >
                  {crucigrama.tablero.map((fila, filaIndex) =>
                    fila.map((casilla, columnaIndex) => {
                      const esSeleccionada =
                        casillaSeleccionada.fila === filaIndex &&
                        casillaSeleccionada.columna === columnaIndex;
                      const esParteDePalabra = palabraSeleccionada.some(
                        (p) => p.fila === filaIndex && p.columna === columnaIndex
                      );

                      return (
                        <div
                          key={`${filaIndex}-${columnaIndex}`}
                          style={{
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: esSeleccionada
                              ? '#D5BDAF'
                              : esParteDePalabra
                              ? '#E3D5CA'
                              : casilla === '#'
                              ? '#9F9890'
                              : '#EDEDE9',
                              border: esSeleccionada ? '3px solid #D5BDAF' : 'none',
                              transform: esSeleccionada ? 'scale(1.1)' : 'none',
                              transition: 'transform 0.1s',
                          }}
                          onClick={() => handleCasillaClick(filaIndex, columnaIndex)}
                        >
                          {casilla === '#' ? ' ' : casilla}
                        </div>
                      );
                    })
                  )}
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