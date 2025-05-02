import React, { useState, useEffect, } from 'react';
import Header from './componentes/Header.js';
import SubHeader from './componentes/SubHeader.js';
import InitialScreen from './componentes/InitialScreen.js';
import TabsContainer from './componentes/TabsContainer.js';
import Modal from './componentes/Modal.js';
import './App.css';
import io from 'socket.io-client';
import { ReactComponent as LoadingIcon } from './img/Loading.svg';
import { ReactComponent as SettingsIcon } from './img/Settings.svg';

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
  const [formVisible, setFormVisible] = useState(false); // Formulario de generación de crucigrama visible
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [mostrarModalDesconexion, setMostrarModalDesconexion] = useState(false);
  const [configuracionCrucigrama, setConfiguracionCrucigrama] = useState({ //Configuración de generación de crucigrama
    filas: 13,
    columnas: 13,
    PalabrasColoquiales: true,
    PalabrasEnDesuso: true,
  });

  useEffect(() => {
    
    if (tableroRespuestas && !tableroVisible) {
      setTableroVisible(tableroVisible);
    }
    
    // Escuchar eventos de actualización de jugadores
    socket.on('jugadoresActualizados', (jugadoresActualizados) => {
      setJugadores(jugadoresActualizados);
    });

    // Escuchar eventos de actualización de configuración
    socket.on('configuracionActualizada', (nuevaConfiguracion) => {
      setConfiguracionCrucigrama(nuevaConfiguracion);
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

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Limpiar eventos al desmontar el componente
    return () => {
      socket.off('jugadoresActualizados');
      socket.off('tablerosActualizados');
      socket.off('configuracionActualizada');
      socket.off('connect_error');
      socket.off('casillaActualizada');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tableroRespuestas, tableroVisible]);

  const generarCrucigrama = () => {
    if (tableroVisible) {
      setMostrarModalConfirmacion(true);
      return;
    }

      iniciarGeneracionCrucigrama();
    };

  const iniciarGeneracionCrucigrama = () => {
    setIsLoading(true); // Activar el estado de carga
    socket.emit('generarCrucigrama', { codigoSala, configuracion: configuracionCrucigrama }, (response) => {
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
        setJugadores(response.jugadores || []);
        setTableroRespuestas(response.tableroRespuestas || null);
        setTableroVisible(response.tableroVisible || null);
        setPistas(response.pistas || null);
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
    setConfiguracionCrucigrama({
      filas: 13,
      columnas: 13,
      PalabrasColoquiales: true,
      PalabrasEnDesuso: true,
    });
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

  const handleConfiguracionChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nuevaConfiguracion = {
      ...configuracionCrucigrama,
      [name]: type === 'checkbox' ? checked : parseInt(value, 10),
    };
    setConfiguracionCrucigrama(nuevaConfiguracion);
  
    // Emitir la configuración al backend automáticamente
    socket.emit('guardarConfiguracion', { codigoSala, configuracionCrucigrama: nuevaConfiguracion }, (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        console.log('Configuración guardada automáticamente');
      }
    });
  };

  const verificarCasilla = () => {
    const { fila, columna } = casillaSeleccionada;
    const letraCorrecta = tableroRespuestas[fila][columna];
    const letraVisible = tableroVisible[fila][columna];
    const esCorrecto = letraVisible === letraCorrecta;

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

    if (fila >= 0 && fila < tableroRespuestas.length && columna >= 0 && columna < tableroRespuestas[0].length) {
      
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
      {mostrarModalDesconexion && (
        <Modal
          mensaje="¿Estás seguro de que deseas salir de la sala? Perderás tu progreso."
          confirmar="Salir de la sala"
          cancelar="Cancelar"
          onConfirmar={() => {
            setMostrarModalDesconexion(false);
            salirSala();
          }}
          onCancelar={() => setMostrarModalDesconexion(false)}
        />
      )}

      {mostrarModalConfirmacion && (
        <Modal
          mensaje="¿Estás seguro de que deseas generar un nuevo crucigrama? Esto eliminará el actual."
          confirmar="Generar crucigrama"
          cancelar="Cancelar"
          onConfirmar={() => {
            setMostrarModalConfirmacion(false);
            iniciarGeneracionCrucigrama();
          }}
          onCancelar={() => setMostrarModalConfirmacion(false)}
        />
      )}

      {screen === 'initial' && (
        <InitialScreen
          nombre={nombre}
          onNombreChange={setNombre}
          codigoSalaInput={codigoSalaInput}
          onCodigoChange={setCodigoSalaInput}
          onCrearSala={crearSala}
          onUnirseSala={unirseSala}
          error={error}
          setError={setError}
        />
      )}

      {screen === 'sala' && (
        <>
          <Header onExit={() => setMostrarModalDesconexion(true)} jugadores={jugadores} />
          <SubHeader
            nombre={nombre}
            codigoSala={codigoSala}
            showCopiedIcon={showCopiedIcon}
            onCopy={copiarCodigoSala}
          />
          <div className="main-content">
          <div className="crossword-container">
              {tableroVisible && (
                <div
                  className="crossword-grid"
                  style={{gridTemplateColumns: `repeat(${tableroVisible[0].length}, 1fr)`, '--grid-rows': tableroVisible.length}}
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
                        <div key={`${filaIndex}-${columnaIndex}`} style={{ '--animation-delay': animacion?.delay || '0s', }} onClick={() => handleCasillaClick(filaIndex, columnaIndex)}
                          className={`casilla ${
                            casilla === '#' ? 'negra' : esSeleccionada ? 'seleccionada' : esParteDePalabra? 'parte-de-palabra' : 'vacia'
                            } ${animacion ? (animacion.tipo === 'correcto' ? 'correcto' : 'error') : ''}`}
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
                            <input type="text" maxLength="1" value={casilla === '#' ? '' : casilla}
                              onKeyDown={(e) => {
                                const letra = e.key.toUpperCase();

                                // Validar si es una letra o Backspace
                                if (/^[A-ZÑÁÉÍÓÚÜ]$/.test(letra)) {
                                  e.preventDefault();
                            
                                  const nuevoCrucigrama = [...tableroVisible];
                                  nuevoCrucigrama[filaIndex][columnaIndex] = letra;
                                  setTableroVisible(nuevoCrucigrama);
                            
                                  // Emitir el cambio al servidor
                                  socket.emit('actualizarCasilla', { codigoSala, fila: filaIndex, columna: columnaIndex, letra, });
                            
                                  // Mover a la siguiente casilla
                                  if (orientacion === 'horizontal') {
                                    let nuevaColumna = columnaIndex + 1;

                                    while ( nuevaColumna < tableroRespuestas[filaIndex].length && tableroRespuestas[filaIndex][nuevaColumna] === '#'
                                    ) { nuevaColumna++; }
                                    if (nuevaColumna < tableroRespuestas[filaIndex].length) {
                                      setCasillaSeleccionada({ fila: filaIndex, columna: nuevaColumna });
                                      intentarSeleccionarPalabra(filaIndex, nuevaColumna);
                                    }
                                  } else {
                                    let nuevaFila = filaIndex + 1;

                                    while ( nuevaFila < tableroRespuestas.length && tableroRespuestas[nuevaFila][columnaIndex] === '#'
                                    ) { nuevaFila++; }
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
                            
                                  // Emitir el cambio al servidor
                                  socket.emit('actualizarCasilla', { codigoSala, fila: filaIndex, columna: columnaIndex, letra: '', });
                            
                                  // Mover a la casilla anterior
                                  if (orientacion === 'horizontal') {
                                    let nuevaColumna = columnaIndex - 1;

                                    while ( nuevaColumna >= 0 && tableroRespuestas[filaIndex][nuevaColumna] === '#'
                                    ) { nuevaColumna--; }
                                    if (nuevaColumna >= 0) {
                                      setCasillaSeleccionada({ fila: filaIndex, columna: nuevaColumna });
                                      intentarSeleccionarPalabra(filaIndex, nuevaColumna);
                                    }

                                  } else {
                                    let nuevaFila = filaIndex - 1;

                                    while ( nuevaFila >= 0 && tableroRespuestas[nuevaFila][columnaIndex] === '#'
                                    ) { nuevaFila--; }
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
                            
                                  // Emitir el cambio al servidor
                                  socket.emit('actualizarCasilla', { codigoSala, fila: filaIndex, columna: columnaIndex, letra, });
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
                  <div>
                  <button disabled={isLoading} className="generate-button"
                    onClick={(e) => { e.stopPropagation(); generarCrucigrama(); }} 
                  >
                    {isLoading ? (
                      <LoadingIcon className="loading-icon" />
                    ) : (
                      <>
                        Generar Crucigrama
                        <div className="settings-icon-container"
                          onMouseEnter={(e) => { e.stopPropagation(); setFormVisible(true); }}
                          onMouseLeave={(e) => { e.stopPropagation(); setFormVisible(false); }}
                        >
                          <SettingsIcon className="settings-icon" />
                          {formVisible && (
                            <form className="config-form" onClick={(e) => e.stopPropagation() } onSubmit={(e) => { e.preventDefault(); }}>
                              <label>
                                Filas:
                                <input type="number" name="filas" min="9" max="21" value={configuracionCrucigrama.filas}
                                  onChange={(e) => { e.stopPropagation(); handleConfiguracionChange(e); }}
                                  onKeyDown={(e) => e.preventDefault()}
                                />
                              </label>
                              <label>
                                Columnas:
                                <input type="number" name="columnas" min="9" max="21" value={configuracionCrucigrama.columnas}
                                  onChange={(e) => { e.stopPropagation(); handleConfiguracionChange(e); }}
                                  onKeyDown={(e) => e.preventDefault()}
                                />
                              </label>
                              <label>
                                <input type="checkbox" name="PalabrasColoquiales" checked={configuracionCrucigrama.PalabrasColoquiales}
                                  onChange={(e) => { e.stopPropagation(); handleConfiguracionChange(e); }}
                                />
                                Palabras coloquiales
                              </label>
                              <label>
                                <input type="checkbox" name="PalabrasEnDesuso" checked={configuracionCrucigrama.PalabrasEnDesuso}
                                  onChange={(e) => { e.stopPropagation(); handleConfiguracionChange(e); }}
                                />
                                Palabras en desuso
                              </label>
                            </form>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                </div>
                )}
                {tableroVisible && (
                  <>
                    <button onClick={verificarCasilla}>Verificar Casilla</button>
                    <button onClick={verificarPalabra}>Verificar Palabra</button>
                    <button onClick={verificarTablero}>Verificar Tablero</button>
                  </>
                )}
              </div>
              {tableroVisible && (
                <>
                  <p className="help-text">Usa las flechas para moverte entre casillas y Tab para cambiar la orientación.</p>
                </>
              )}
            </div>
            <TabsContainer
              pestanaActiva={pestanaActiva}
              onTabChange={setPestanaActiva}
              definicionSeleccionada={definicionSeleccionada}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;