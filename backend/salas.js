const { nanoid } = require('nanoid');
const { generarCrucigrama: generarCrucigramaDesdeModulo } = require('./crucigramas');
const { inicializarEstadisticas, actualizarPuntosCasilla, actualizarPuntosPalabra, obtenerEstadisticasSala, reiniciarEstadisticasSala, eliminarEstadisticasJugador} = require('./estadisticas');

let io;
const salas = {};

const inicializarIO = (ioInstance) => {
  io = ioInstance;
};

const crearSala = (socket, { nombre, codigoSalaInput }, callback) => {
  const codigoSala = codigoSalaInput || nanoid(6);
  if (salas[codigoSala]) {
    callback({ error: 'La sala con este ID ya existe.' });
    return;
  }

  const jugador = { id: socket.id, nombre };
  salas[codigoSala] = {
    jugadores: [jugador],
    tableroRespuestas: null,
    pistas: null,
    tableroVisible: null,
    configuracionCrucigrama: {
      filas: 13,
      columnas: 13,
      PalabrasColoquiales: true,
      PalabrasEnDesuso: true,
    }
  };

  inicializarEstadisticas(codigoSala, socket.id);

  socket.join(codigoSala);
  console.log(`Sala creada: ${codigoSala}`);
  socket.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);

  callback({ codigoSala, jugador, configuracionCrucigrama: salas[codigoSala].configuracionCrucigrama });
};

const unirseSala = (socket, { codigoSala, nombre }, callback) => {
  if (!salas[codigoSala]) {
    callback({ error: 'La sala no existe.' });
    return;
  }
  
  // Verificar límite de jugadores
  if (salas[codigoSala].jugadores.length >= 5) {
    callback({ error: 'La sala está llena (máximo 5 jugadores).' });
    return;
  }

  const jugador = { id: socket.id, nombre };
  salas[codigoSala].jugadores.push(jugador);

  inicializarEstadisticas(codigoSala, socket.id);

  socket.join(codigoSala);
  console.log(`Jugador ${socket.id} (${nombre}) se unió a la sala ${codigoSala}`);

  callback({
    jugador,
    jugadores: salas[codigoSala].jugadores,
    tableroRespuestas: salas[codigoSala].tableroRespuestas,
    tableroVisible: salas[codigoSala].tableroVisible,
    pistas: salas[codigoSala].pistas,
    configuracionCrucigrama: salas[codigoSala].configuracionCrucigrama
  });

  socket.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);
};

const salirSala = (socket, { codigoSala, nombre }) => {
  if (!salas[codigoSala]) return;

  salas[codigoSala].jugadores = salas[codigoSala].jugadores.filter(
    (jugador) => jugador.id !== socket.id
  );

  console.log(`Jugador ${socket.id} (${nombre}) salió de la sala ${codigoSala}`);
  socket.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);

  if (salas[codigoSala].jugadores.length === 0) {
    delete salas[codigoSala];
    console.log(`Sala ${codigoSala} eliminada porque no tiene jugadores.`);
  }
};

const manejarDesconexion = (socket) => {

  for (const codigoSala in salas) {
    const sala = salas[codigoSala];
    const jugadorIndex = sala.jugadores.findIndex((jugador) => jugador.id === socket.id);

    if (jugadorIndex !== -1) {
      sala.jugadores.splice(jugadorIndex, 1);
      console.log(`Jugador ${socket.id} salió de la sala ${codigoSala}`);
      socket.to(codigoSala).emit('jugadoresActualizados', sala.jugadores);

      if (sala.jugadores.length === 0) {
        delete salas[codigoSala];
        console.log(`Sala ${codigoSala} eliminada porque no tiene jugadores.`);
      }
      break;
    }
  }
};

const generarCrucigrama = async (socket, { codigoSala, configuracion }, callback) => {
  if (!salas[codigoSala]) {
    callback({ error: 'La sala no existe.' });
    return;
  }

  try {
    reiniciarEstadisticasSala(codigoSala);

    const crucigrama = await generarCrucigramaDesdeModulo(configuracion);

    // Convertir el tablero de respuestas a mayúsculas
    const tableroRespuestas = crucigrama.tablero.map((fila) =>
      fila.map((casilla) => (casilla && casilla !== '#' ? casilla.toUpperCase() : casilla))
    );

    // Asignar el tablero de respuestas y las pistas al estado de la sala
    salas[codigoSala].tableroRespuestas = tableroRespuestas;
    salas[codigoSala].pistas = crucigrama.pistas;

    // Crear el tablero visible basado en el tablero de respuestas
    salas[codigoSala].tableroVisible = tableroRespuestas.map((fila) =>
      fila.map((casilla) => (casilla === '#' ? '#' : ''))
    );

    // Emitir el crucigrama generado a todos los jugadores de la sala
    socket.to(codigoSala).emit('tablerosActualizados', {
      tableroRespuestas: salas[codigoSala].tableroRespuestas,
      tableroVisible: salas[codigoSala].tableroVisible,
      pistas: salas[codigoSala].pistas,
    });

    const estadisticas = obtenerEstadisticasSala(codigoSala);
    io.to(codigoSala).emit('estadisticasActualizadas', estadisticas);

    callback({
      tableroRespuestas: salas[codigoSala].tableroRespuestas,
      tableroVisible: salas[codigoSala].tableroVisible,
      pistas: salas[codigoSala].pistas,
    });
    
  } catch (error) {
    console.error('Error al generar crucigrama:', error);
    callback({ error: 'Error al generar el crucigrama.' });
  }
};

const actualizarCasilla = (socket, { codigoSala, fila, columna, letra }) => {
  if (!salas[codigoSala]) return;

  // Actualizar el tablero visible
  salas[codigoSala].tableroVisible[fila][columna] = letra;

  // Verificar si la letra es correcta
  const esCorrecta = letra === salas[codigoSala].tableroRespuestas[fila][columna];
  
  if (esCorrecta) {
    const puntosNuevos = actualizarPuntosCasilla(codigoSala, socket.id, fila, columna);
  
    const palabrasCompletadas = verificarPalabrasCompletadas(codigoSala, fila, columna);
    palabrasCompletadas.forEach((palabra) => {
      actualizarPuntosPalabra(codigoSala, socket.id, palabra.texto, palabra.posiciones.length);
    });

    // Emitir actualización de estadísticas
    const estadisticas = obtenerEstadisticasSala(codigoSala);
    io.to(codigoSala).emit('estadisticasActualizadas', estadisticas);
  }

  // Emitir actualización de casilla
  socket.to(codigoSala).emit('casillaActualizada', { fila, columna, letra });
};

const guardarConfiguracion = (socket, { codigoSala, configuracionCrucigrama }, callback) => {
  const sala = salas[codigoSala];
  if (!sala) {
    return callback({ error: 'La sala no existe.' });
  }

  // Actualizar la configuración de la sala
  sala.configuracionCrucigrama = configuracionCrucigrama;

  socket.to(codigoSala).emit('configuracionActualizada', configuracionCrucigrama);

  callback({ success: true });
};

const verificarPalabrasCompletadas = (codigoSala, fila, columna) => {
  const sala = salas[codigoSala];
  const palabrasCompletadas = [];

  // Verificar palabra horizontal
  let inicioH = columna;
  while (inicioH > 0 && sala.tableroRespuestas[fila][inicioH - 1] !== '#') inicioH--;
  let finH = columna;
  while (finH < sala.tableroRespuestas[fila].length && sala.tableroRespuestas[fila][finH] !== '#') finH++;

  if (finH - inicioH > 1) {
    let palabraH = '';
    let completa = true;
    let posicionesH = [];
    
    for (let c = inicioH; c < finH; c++) {
      if (sala.tableroVisible[fila][c] !== sala.tableroRespuestas[fila][c]) {
        completa = false;
        break;
      }
      palabraH += sala.tableroRespuestas[fila][c];
      posicionesH.push({ fila, columna: c });
    }
    
    if (completa) {
      palabrasCompletadas.push({
        texto: palabraH,
        posiciones: posicionesH,
        orientacion: 'horizontal'
      });
    }
  }

  // Verificar palabra vertical
  let inicioV = fila;
  while (inicioV > 0 && sala.tableroRespuestas[inicioV - 1][columna] !== '#') inicioV--;
  let finV = fila;
  while (finV < sala.tableroRespuestas.length && sala.tableroRespuestas[finV][columna] !== '#') finV++;

  if (finV - inicioV > 1) {
    let palabraV = '';
    let completa = true;
    let posicionesV = [];
    
    for (let f = inicioV; f < finV; f++) {
      if (sala.tableroVisible[f][columna] !== sala.tableroRespuestas[f][columna]) {
        completa = false;
        break;
      }
      palabraV += sala.tableroRespuestas[f][columna];
      posicionesV.push({ fila: f, columna });
    }
    
    if (completa) {
      palabrasCompletadas.push({
        texto: palabraV,
        posiciones: posicionesV,
        orientacion: 'vertical'
      });
    }
  }

  return palabrasCompletadas;
};

module.exports = { inicializarIO, crearSala, unirseSala, salirSala, manejarDesconexion, generarCrucigrama, actualizarCasilla, guardarConfiguracion, verificarPalabrasCompletadas };
