const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { generarCrucigrama } = require('./crucigramas');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));

const port = 5000;

// Almacena las salas y sus jugadores
const salas = {};

// Evento de conexión de socket
io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  // Crear una sala
  socket.on('crearSala', ({ nombre, codigoSalaInput }, callback) => {
    const codigoSala = codigoSalaInput || uuidv4();

    if (salas[codigoSala]) {
      callback({ error: 'La sala con este ID ya existe.' });
        return;
      }
  
    const jugador = { id: socket.id, nombre };
    salas[codigoSala] = { jugadores: [jugador], crucigrama: null };

    socket.join(codigoSala);
    console.log(`Sala creada: ${codigoSala}`);
    io.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);

    callback({ codigoSala, jugador });
  });

  // Unirse a una sala
  socket.on('unirseSala', ({ codigoSala, nombre }, callback) => {
    if (!salas[codigoSala]) {
      callback({ error: 'La sala no existe.' });
      return;
    }

    const jugador = { id: socket.id, nombre };
    salas[codigoSala].jugadores.push(jugador);

    socket.join(codigoSala);
    console.log(`Jugador ${socket.id} (${nombre}) se unió a la sala ${codigoSala}`);
    io.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);

    callback({ jugador, crucigrama: salas[codigoSala].crucigrama });
  });

  // Generar crucigrama (solo el anfitrión puede hacerlo)
  socket.on('generarCrucigrama', async ({ codigoSala }, callback) => {
    if (!salas[codigoSala]) {
      callback({ error: 'La sala no existe.' });
      return;
    }

    const sala = salas[codigoSala];
    const anfitrion = sala.jugadores[0]; // El anfitrión es el primer jugador en la lista

    if (socket.id !== anfitrion.id) {
      callback({ error: 'Solo el anfitrión puede generar el crucigrama.' });
      return;
    }

    try {
      const crucigrama = await generarCrucigrama();
      sala.crucigrama = crucigrama;

      io.to(codigoSala).emit('crucigramaGenerado', crucigrama); // Notificar a todos los jugadores
      callback({ crucigrama });
    } catch (error) {
      console.error('Error al generar crucigrama:', error);
      callback({ error: 'Error al generar el crucigrama.' });
    }
  });

  // Actualizar una casilla del crucigrama
  socket.on('actualizarCasilla', ({ codigoSala, fila, columna, letra }) => {
    if (!salas[codigoSala]) return;
  
    // Actualizar el crucigrama en el servidor
    salas[codigoSala].crucigrama.tablero[fila][columna] = letra;
  
    // Emitir el cambio a todos los jugadores de la sala
    io.to(codigoSala).emit('casillaActualizada', { fila, columna, letra });
  });

  // Salir de una sala
  socket.on('salirSala', ({ codigoSala, nombre }) => {
    if (!salas[codigoSala]) return;
  
    salas[codigoSala].jugadores = salas[codigoSala].jugadores.filter(
      (jugador) => jugador.id !== socket.id
    );
  
    console.log(`Jugador ${socket.id} (${nombre}) salió de la sala ${codigoSala}`);
    io.to(codigoSala).emit('jugadoresActualizados', salas[codigoSala].jugadores);
  
    if (salas[codigoSala].jugadores.length === 0) {
      delete salas[codigoSala]; // Eliminar la sala y su crucigrama
      console.log(`Sala ${codigoSala} eliminada porque no tiene jugadores.`);
    }
  });

  // Desconexión del jugador
  socket.on('disconnect', () => {
    console.log(`Jugador desconectado: ${socket.id}`);

    for (const codigoSala in salas) {
        const sala = salas[codigoSala];
      const jugadorIndex = sala.jugadores.findIndex((jugador) => jugador.id === socket.id);

        if (jugadorIndex !== -1) {
          const [jugador] = sala.jugadores.splice(jugadorIndex, 1);
        console.log(`Jugador ${jugador.nombre} eliminado de la sala ${codigoSala}`);
        io.to(codigoSala).emit('jugadoresActualizados', sala.jugadores);

          if (sala.jugadores.length === 0) {
        delete salas[codigoSala];
        console.log(`Sala ${codigoSala} eliminada porque no tiene jugadores.`);
          }
          break;
      }
    }
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});