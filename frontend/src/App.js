import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import logo from './img/Logo.png';
import { ReactComponent as CopyIcon } from './img/Copy.svg';
import { ReactComponent as CopiedIcon } from './img/CopyChecked.svg';
import { ReactComponent as GroupIcon } from './img/GroupRounded.svg';
import { ReactComponent as ExitIcon } from './img/ExitBold.svg';
import { ReactComponent as LoadingIcon } from './img/Loading.svg';

// Inicializar conexión con el servidor de socket
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

function App() {
  const [screen, setScreen] = useState('initial'); // Manejar la pantalla actual
  const [codigoSala, setCodigoSala] = useState(''); // Almacenar el código de la sala
  const [codigoSalaInput, setCodigoSalaInput] = useState(''); // Almacenar el input del código de sala
  const [nombre, setNombre] = useState(''); // Almacenar el nombre del jugador
  const [error, setError] = useState(''); // Almacenar mensajes de error
  const [tableroRespuestas, setTableroRespuestas] = useState(null); // Tablero de respuestas correctas
  const [tableroVisible, setTableroVisible] = useState(null); // Tablero visible para los jugadores
  const [pestanaActiva, setPestanaActiva] = useState('palabras'); // Manejar la pestaña activa
  const [jugadores, setJugadores] = useState([]); // Almacenar la lista de jugadores
  const [isLoading, setIsLoading] = useState(false); // Manejar el estado de carga
  const [casillaSeleccionada, setCasillaSeleccionada] = useState({ fila: 0, columna: 0 }); // Casilla seleccionada
  const [orientacion, setOrientacion] = useState('horizontal'); // Orientación de la palabra seleccionada
  const [showCopiedIcon, setShowCopiedIcon] = useState(false); // Estado para mostrar el ícono
  const [pistas, setPistas] = useState([]); // Estado para almacenar las pistas
  const [animaciones, setAnimaciones] = useState([]); // Estado para manejar animaciones

  useEffect(() => {
    
    if (tableroRespuestas && !tableroVisible) {
      setTableroVisible(tableroVisible);
    }
    
    // Escuchar eventos de actualización de jugadores
    socket.on('jugadoresActualizados', (jugadoresActualizados) => {
      setJugadores(jugadoresActualizados);
    });

    // Escuchar eventos de actualización de tableros
    socket.on('tablerosActualizados', ({ tableroRespuestas, tableroVisible, pistas }) => {
      setTableroRespuestas(tableroRespuestas);
      setTableroVisible(tableroVisible);
      setPistas(pistas);
    });

    // Manejar errores de conexión
    socket.on('connect_error', () => {
      setError('Error de conexión con el servidor.');
    });

    // Escuchar actualizaciones de casillas
    socket.on('casillaActualizada', ({ fila, columna, letra }) => {
      setTableroVisible((prevCrucigrama) => {
        const nuevoCrucigrama = [...prevCrucigrama];
        nuevoCrucigrama[fila][columna] = letra;
        return nuevoCrucigrama;
      });
    });

    // Limpiar eventos al desmontar el componente
    return () => {
      socket.off('jugadoresActualizados');
      socket.off('tablerosActualizados');
      socket.off('connect_error');
      socket.off('casillaActualizada');
    };
  }, [tableroRespuestas, tableroVisible]);

  const generarCrucigrama = () => {
    setIsLoading(true); // Activar el estado de carga
    socket.emit('generarCrucigrama', { codigoSala }, (response) => {
      setIsLoading(false); // Desactivar el estado de carga
      if (response.error) {
        setError(response.error);
      } else {
        setTableroRespuestas(response.tableroRespuestas);
        setTableroVisible(response.tableroVisible);
        setPistas(response.pistas);
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
        setTableroVisible(response.tableroVisible);
        setTableroRespuestas(response.tableroRespuestas);
        setPistas(response.pistas);
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
        setJugadores(response.jugadores);
        setTableroRespuestas(response.tableroRespuestas || []);
        setTableroVisible(response.tableroVisible || []);
        setPistas(response.pistas || []);
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
    setTableroRespuestas(null);
    setTableroVisible(null);
    setPistas(null);
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
    const casilla = tableroRespuestas[fila][columna];
    if (casilla === '#') return; // No permitir seleccionar casillas negras

    const horizontal = tienePalabraHorizontal(fila, columna, tableroRespuestas);
    const vertical = tienePalabraVertical(fila, columna, tableroRespuestas);

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

  const intentarSeleccionarPalabra = (fila, columna) => {
    const horizontal = tienePalabraHorizontal(fila, columna, tableroRespuestas);
    const vertical = tienePalabraVertical(fila, columna, tableroRespuestas);

    if (orientacion === 'vertical' && vertical) {
      setOrientacion('vertical');
    } else if (orientacion === 'horizontal' && horizontal) {
      setOrientacion('horizontal');
    } else if (vertical) {
      setOrientacion('vertical');
    } else if (horizontal) {
      setOrientacion('horizontal');
    }
  };

  const handleKeyDown = (e) => {
    const { fila, columna } = casillaSeleccionada;
  
    const seleccionarNuevaPalabra = (nuevaFila, nuevaColumna, nuevaOrientacion) => {
      setCasillaSeleccionada({ fila: nuevaFila, columna: nuevaColumna });
      setOrientacion(nuevaOrientacion);
    };
  
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      let nuevaFila = fila - 1;
      while (nuevaFila >= 0 && tableroRespuestas[nuevaFila][columna] === '#') {
        nuevaFila--;
      }
      if (nuevaFila >= 0) {
        seleccionarNuevaPalabra(nuevaFila, columna, 'vertical');
        intentarSeleccionarPalabra(nuevaFila, columna);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let nuevaFila = fila + 1;
      while (nuevaFila < tableroRespuestas.length && tableroRespuestas[nuevaFila][columna] === '#') {
        nuevaFila++;
      }
      if (nuevaFila < tableroRespuestas.length) {
        seleccionarNuevaPalabra(nuevaFila, columna, 'vertical');
        intentarSeleccionarPalabra(nuevaFila, columna);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      let nuevaColumna = columna - 1;
      while (nuevaColumna >= 0 && tableroRespuestas[fila][nuevaColumna] === '#') {
        nuevaColumna--;
      }
      if (nuevaColumna >= 0) {
        seleccionarNuevaPalabra(fila, nuevaColumna, 'horizontal');
        intentarSeleccionarPalabra(fila, nuevaColumna);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      let nuevaColumna = columna + 1;
      while (nuevaColumna < tableroRespuestas[fila].length && tableroRespuestas[fila][nuevaColumna] === '#') {
        nuevaColumna++;
      }
      if (nuevaColumna < tableroRespuestas[fila].length) {
        seleccionarNuevaPalabra(fila, nuevaColumna, 'horizontal');
        intentarSeleccionarPalabra(fila, nuevaColumna);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Evitar el comportamiento predeterminado del tab
      const horizontal = tienePalabraHorizontal(fila, columna, tableroRespuestas);
      const vertical = tienePalabraVertical(fila, columna, tableroRespuestas);
      if (horizontal && vertical) {
        setOrientacion((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
      }
    }
  
    // Actualizar la palabra seleccionada después de cambiar la casilla
    obtenerPalabraSeleccionada();
  };

  const verificarCasilla = () => {
    const { fila, columna } = casillaSeleccionada;
    const letraCorrecta = tableroRespuestas[fila][columna];
    const letraVisible = tableroVisible[fila][columna];
    const esCorrecto = letraVisible === letraCorrecta;

    console.log(`letra correcta`, letraCorrecta);
    console.log(`letra visible`, letraVisible);

    setAnimaciones([{ fila, columna, tipo: esCorrecto ? 'correcto' : 'error' }]);

    setTimeout(() => setAnimaciones([]), 2000);
  };

  const verificarPalabra = () => {
    const nuevasAnimaciones = [];
    let esPalabraCorrecta = true;
  
    // Recorrer las casillas de la palabra seleccionada
    palabraSeleccionada.forEach(({ fila, columna }, index) => {
      const letraCorrecta = tableroRespuestas[fila][columna];
      const letraVisible = tableroVisible[fila][columna];
  
      if (letraVisible !== letraCorrecta) {
        // Si hay una casilla incorrecta, agregar animación de error
        nuevasAnimaciones.push({ fila, columna, tipo: 'error' });
        esPalabraCorrecta = false; // Marcar que la palabra no es completamente correcta
      }
    });
  
    if (esPalabraCorrecta) {
      // Si toda la palabra es correcta, aplicar animación de correcto a todas las casillas
      palabraSeleccionada.forEach(({ fila, columna }, index) => {
        nuevasAnimaciones.push({ fila, columna, tipo: 'correcto', delay: `${index * 0.1}s`, });
      });
    }
  
    setAnimaciones(nuevasAnimaciones);
  };

  const verificarTablero = () => {
    const nuevasAnimaciones = [];
    let esTodoCorrecto = true;
  
    // Recorrer el tablero visible y compararlo con el tablero de respuestas
    tableroVisible.forEach((fila, filaIndex) => {
      fila.forEach((casilla, columnaIndex) => {
        if (casilla !== tableroRespuestas[filaIndex][columnaIndex]) {
          // Si hay una casilla incorrecta, agregar animación de error
          nuevasAnimaciones.push({ fila: filaIndex, columna: columnaIndex, tipo: 'error'})
          esTodoCorrecto = false;
        }
      });
    });
  
    if (esTodoCorrecto) {
      // Si todo el tablero es correcto, aplicar animación de correcto a todas las casillas
      tableroVisible.forEach((fila, filaIndex) => {
        fila.forEach((casilla, columnaIndex) => {
          if (casilla !== '#') {
            nuevasAnimaciones.push({ fila: filaIndex, columna: columnaIndex, tipo: 'correcto', delay: `${(filaIndex * fila.length + columnaIndex) * 0.01}s`, });
          }
        });
      });
    }
  
    setAnimaciones(nuevasAnimaciones);
  };

  const copiarCodigoSala = () => {
    navigator.clipboard.writeText(codigoSala);
    setShowCopiedIcon(true);
    setTimeout(() => setShowCopiedIcon(false), 2000);
  };

  const obtenerPalabraSeleccionada = () => {
    if (!tableroRespuestas) return [];
    const { fila, columna } = casillaSeleccionada;
    let palabra = [];
    if (orientacion === 'horizontal') {
      // Obtener palabra horizontal
      let inicio = columna;
      while (inicio > 0 && tableroRespuestas[fila][inicio - 1] !== '#') inicio--;
      let fin = columna;
      while (fin < tableroRespuestas[fila].length && tableroRespuestas[fila][fin] !== '#') fin++;
      palabra = tableroRespuestas[fila].slice(inicio, fin).map((_, index) => ({
        fila,
        columna: inicio + index,
      }));
    } else {
      // Obtener palabra vertical
      let inicio = fila;
      while (inicio > 0 && tableroRespuestas[inicio - 1][columna] !== '#') inicio--;
      let fin = fila;
      while (fin < tableroRespuestas.length && tableroRespuestas[fin][columna] !== '#') fin++;
      palabra = tableroRespuestas.slice(inicio, fin).map((_, index) => ({
        fila: inicio + index,
        columna,
      }));
    }
    return palabra;
  };

  const palabraSeleccionada = obtenerPalabraSeleccionada();

  const obtenerDefinicionSeleccionada = () => {
    if (!tableroRespuestas || palabraSeleccionada.length === 0) return null;
  
    // Convertir la palabra seleccionada en un string
    const palabraActual = palabraSeleccionada
      .map(({ fila, columna }) => tableroRespuestas[fila][columna])
      .join('')
      .toLowerCase();
  
    // Buscar la definición correspondiente
    const pista = pistas.find((p) => p.palabra.toLowerCase() === palabraActual);

    if (!pista) {
      console.warn(`No se encontró una pista para la palabra: ${palabraActual}`);
    }
  
    return pista ? pista.definiciones : null;
  };
  
  const definicionSeleccionada = obtenerDefinicionSeleccionada();

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
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {screen === 'sala' && (
        <>
          <div className="header-bar">
            <button className="header-left" onClick={salirSala}>
              <div className="logo-circle"></div>
              <img src={logo} alt="Logo" className="logo" />
            </button>
            <div className="header-center">
              <h1><strong>Crucigramas Cooperativos</strong></h1>
            </div>
            <div className="header-right">
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
            <span><strong>Jugador:</strong> {nombre}</span>
            <span
              className="copy-code"
              onClick={copiarCodigoSala}
            >
              <span className="copy-icon-wrapper">
                {!showCopiedIcon ? <CopyIcon /> : <CopiedIcon />}
              </span>
              <strong>ID Sala:</strong> {codigoSala}
            </span>
          </div>

          {/* Contenedores principales */}
          <div className="main-content">
            <div className="crossword-container">
              {tableroVisible && (
                <div
                  className="crossword-grid"
                  style={{gridTemplateColumns: `repeat(${tableroVisible[0].length}, 1fr)`,}}
                >
                  {tableroVisible.map((fila, filaIndex) =>
                    fila.map((casilla, columnaIndex) => {
                      const esSeleccionada =
                        casillaSeleccionada.fila === filaIndex &&
                        casillaSeleccionada.columna === columnaIndex;
                      const esParteDePalabra = palabraSeleccionada.some(
                        (p) => p.fila === filaIndex && p.columna === columnaIndex
                      );

                      // Buscar si la casilla tiene una animación activa
                      const animacion = animaciones.find(
                        (a) => a.fila === filaIndex && a.columna === columnaIndex
                      );

                      return (
                        <div
                          key={`${filaIndex}-${columnaIndex}`}
                          className={`casilla ${
                            casilla === '#'
                              ? 'negra'
                              : esSeleccionada
                              ? 'seleccionada'
                              : esParteDePalabra
                              ? 'parte-de-palabra'
                              : 'vacia'
                            } ${animacion ? (animacion.tipo === 'correcto' ? 'correcto' : 'error') : ''}`}
                          style={{
                            '--animation-delay': animacion?.delay || '0s',
                          }}
                          onClick={() => handleCasillaClick(filaIndex, columnaIndex)}
                          onAnimationEnd={() => {
                            // Eliminar la animación de la casilla cuando termine
                            setAnimaciones((prevAnimaciones) =>
                              prevAnimaciones.filter(
                                (a) => !(a.fila === filaIndex && a.columna === columnaIndex)
                              )
                            );
                          }}
                        >
                          {casilla === '#' ? '' : esSeleccionada ? (
                            <input
                              type="text"
                              maxLength="1"
                              value={casilla === '#' ? '' : casilla}
                              onKeyDown={(e) => {
                                const letra = e.key.toUpperCase();
                            
                                // Validar si es una letra o Backspace
                                if (/^[A-ZÑÁÉÍÓÚÜ]$/.test(letra)) {
                                  e.preventDefault();
                            
                                  const nuevoCrucigrama = [...tableroVisible];
                                  nuevoCrucigrama[filaIndex][columnaIndex] = letra;
                                  setTableroVisible(nuevoCrucigrama);
                            
                                  // Emitir el cambio al servidor
                                  socket.emit('actualizarCasilla', {
                                    codigoSala,
                                    fila: filaIndex,
                                    columna: columnaIndex,
                                    letra,
                                  });
                            
                                  // Mover a la siguiente casilla
                                  if (orientacion === 'horizontal') {
                                    let nuevaColumna = columnaIndex + 1;
                                    while (
                                      nuevaColumna < tableroRespuestas[filaIndex].length &&
                                      tableroRespuestas[filaIndex][nuevaColumna] === '#'
                                    ) {
                                      nuevaColumna++;
                                    }
                                    if (nuevaColumna < tableroRespuestas[filaIndex].length) {
                                      setCasillaSeleccionada({ fila: filaIndex, columna: nuevaColumna });
                                      intentarSeleccionarPalabra(filaIndex, nuevaColumna);
                                    }
                                  } else {
                                    let nuevaFila = filaIndex + 1;
                                    while (
                                      nuevaFila < tableroRespuestas.length &&
                                      tableroRespuestas[nuevaFila][columnaIndex] === '#'
                                    ) {
                                      nuevaFila++;
                                    }
                                    if (nuevaFila < tableroRespuestas.length) {
                                      setCasillaSeleccionada({ fila: nuevaFila, columna: columnaIndex });
                                      intentarSeleccionarPalabra(nuevaFila, columnaIndex);
                                    }
                                  }
                                } else if (e.key === 'Backspace') {
                                  e.preventDefault(); // Evitar el comportamiento predeterminado
                            
                                  const nuevoCrucigrama = [...tableroVisible];
                                  nuevoCrucigrama[filaIndex][columnaIndex] = '';
                                  setTableroVisible(nuevoCrucigrama);
                            
                                  console.log(`Backspace presionado en [${filaIndex}, ${columnaIndex}]`);
                            
                                  // Emitir el cambio al servidor
                                  socket.emit('actualizarCasilla', {
                                    codigoSala,
                                    fila: filaIndex,
                                    columna: columnaIndex,
                                    letra: '',
                                  });
                            
                                  // Mover a la casilla anterior
                                  if (orientacion === 'horizontal') {
                                    let nuevaColumna = columnaIndex - 1;
                                    while (
                                      nuevaColumna >= 0 &&
                                      tableroRespuestas[filaIndex][nuevaColumna] === '#'
                                    ) {
                                      nuevaColumna--;
                                    }
                                    if (nuevaColumna >= 0) {
                                      setCasillaSeleccionada({ fila: filaIndex, columna: nuevaColumna });
                                      intentarSeleccionarPalabra(filaIndex, nuevaColumna);
                                    }
                                  } else {
                                    let nuevaFila = filaIndex - 1;
                                    while (
                                      nuevaFila >= 0 &&
                                      tableroRespuestas[nuevaFila][columnaIndex] === '#'
                                    ) {
                                      nuevaFila--;
                                    }
                                    if (nuevaFila >= 0) {
                                      setCasillaSeleccionada({ fila: nuevaFila, columna: columnaIndex });
                                      intentarSeleccionarPalabra(nuevaFila, columnaIndex);
                                    }
                                  }
                                }
                              }}
                              onChange={(e) => {
                                const letra = e.target.value.toUpperCase();
                                const nuevoCrucigrama = [...tableroVisible];
                            
                                if (/^[A-ZÑÁÉÍÓÚÜ]?$/.test(letra)) {
                                  nuevoCrucigrama[filaIndex][columnaIndex] = letra || '';
                                  setTableroVisible(nuevoCrucigrama);
                            
                                  console.log(`Estado actualizado de la casilla [${filaIndex}, ${columnaIndex}]: ${nuevoCrucigrama[filaIndex][columnaIndex]}`);
                            
                                  // Emitir el cambio al servidor
                                  socket.emit('actualizarCasilla', {
                                    codigoSala,
                                    fila: filaIndex,
                                    columna: columnaIndex,
                                    letra,
                                  });
                                }
                              }}
                              className="casilla-input"
                              autoFocus
                            />
                          ) : (casilla)}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              <div className={`buttons-container ${!tableroVisible && !isLoading ? 'centered' : ''}`}>
                {esAnfitrion && (
                  <button onClick={generarCrucigrama} disabled={isLoading}>
                    {isLoading ? (<LoadingIcon className="loading-icon"></LoadingIcon>) : ('Generar Crucigrama')}
                  </button>
                )}
                {tableroVisible && (
                  <>
                    <button onClick={verificarCasilla}>Verificar Casilla</button>
                    <button onClick={verificarPalabra}>Verificar Palabra</button>
                    <button onClick={verificarTablero}>Verificar Tablero</button>
                  </>
                )}
              </div>
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
                    {definicionSeleccionada ? (
                      <div>
                        <strong>Definiciones:</strong>
                        <ol className="definition-list">
                          {definicionSeleccionada.map((definicion, index) => (
                            <li key={index}>{definicion}</li>
                          ))}
                        </ol>
                      </div>
                    ) : (
                      <p>Selecciona una palabra para ver sus definiciones.</p>
                    )}
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