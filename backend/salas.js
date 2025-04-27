const { v4: uuidv4 } = require('uuid');
const { generarCrucigrama: generarCrucigramaDesdeModulo } = require('./crucigramas');
const salas = {};

const crearSala = (socket, { nombre, codigoSalaInput }, callback) => {
  const codigoSala = codigoSalaInput || uuidv4();
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
  };

  socket.join(codigoSala);
  console.log(`Sala creada: ${codigoSala}`);
  socket.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);

  callback({ codigoSala, jugador });
};

const unirseSala = (socket, { codigoSala, nombre }, callback) => {
  if (!salas[codigoSala]) {
    callback({ error: 'La sala no existe.' });
    return;
  }

  const jugador = { id: socket.id, nombre };
  salas[codigoSala].jugadores.push(jugador);

  socket.join(codigoSala);
  console.log(`Jugador ${socket.id} (${nombre}) se unió a la sala ${codigoSala}`);

  callback({
    jugador,
    jugadores: salas[codigoSala].jugadores,
    tableroRespuestas: salas[codigoSala].tableroRespuestas,
    tableroVisible: salas[codigoSala].tableroVisible,
    pistas: salas[codigoSala].pistas,
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
  console.log(`Jugador desconectado: ${socket.id}`);

  for (const codigoSala in salas) {
    const sala = salas[codigoSala];
    const jugadorIndex = sala.jugadores.findIndex((jugador) => jugador.id === socket.id);

    if (jugadorIndex !== -1) {
      sala.jugadores.splice(jugadorIndex, 1);
      console.log(`Jugador eliminado de la sala ${codigoSala}`);
      socket.to(codigoSala).emit('jugadoresActualizados', sala.jugadores);

      if (sala.jugadores.length === 0) {
        delete salas[codigoSala];
        console.log(`Sala ${codigoSala} eliminada porque no tiene jugadores.`);
      }
      break;
    }
  }
};

const generarCrucigrama = async (socket, { codigoSala }, callback) => {
  if (!salas[codigoSala]) {
    callback({ error: 'La sala no existe.' });
    return;
  }

  try {
    const crucigrama = await generarCrucigramaDesdeModulo();

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

  // Actualizar el tablero visible en el backend
  salas[codigoSala].tableroVisible[fila][columna] = letra;

  // Emitir el cambio a todos los jugadores de la sala
  socket.to(codigoSala).emit('casillaActualizada', { fila, columna, letra });
};

module.exports = { crearSala, unirseSala, salirSala, manejarDesconexion, generarCrucigrama, actualizarCasilla };
