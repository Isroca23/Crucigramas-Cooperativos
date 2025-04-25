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
  salas[codigoSala] = { jugadores: [jugador], crucigrama: null };

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
  socket.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);

  callback({ jugador, crucigrama: salas[codigoSala].crucigrama });
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
    salas[codigoSala].crucigrama = crucigrama;

    // Emitir el crucigrama generado a todos los jugadores de la sala
    socket.to(codigoSala).emit('tablerosActualizados', {
      tableroRespuestas: crucigrama.tablero,
      tableroVisible: crucigrama.tablero.map((fila) =>
        fila.map((casilla) => (casilla === '#' ? '#' : ''))
      ),
      pistas: crucigrama.pistas,
    });

    callback({
      tableroRespuestas: crucigrama.tablero,
      tableroVisible: crucigrama.tablero.map((fila) =>
        fila.map((casilla) => (casilla === '#' ? '#' : ''))
      ),
      pistas: crucigrama.pistas,
    });
  } catch (error) {
    console.error('Error al generar crucigrama:', error);
    callback({ error: 'Error al generar el crucigrama.' });
  }
};

const actualizarCasilla = (socket, { codigoSala, fila, columna, letra }) => {
  if (!salas[codigoSala]) return;

  salas[codigoSala].crucigrama.tablero[fila][columna] = letra;
  socket.to(codigoSala).emit('casillaActualizada', { fila, columna, letra });
};

module.exports = { crearSala, unirseSala, salirSala, manejarDesconexion, generarCrucigrama, actualizarCasilla };
