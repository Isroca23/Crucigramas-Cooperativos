const express = require('express');
const http = require('http');
const cors = require('cors');
const { generarCrucigrama } = require('./crucigramas');
const { actualizarEstadisticas, calcularEstadisticas } = require('./estadisticas');
const { inicializarTablero } = require('./tablero');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

// Inicializar socket.io
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Permitir solicitudes desde este origen
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:3000" // Permitir solicitudes desde este origen
}));
app.use(express.json());

// Almacenamos las salas en memoria
let salas = {};

// Ruta para generar un crucigrama
app.get('/api/generar', async (req, res) => {
  try {
    const crucigrama = await generarCrucigrama();
    res.json(crucigrama);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar el crucigrama' });
  }
});

// Ruta para crear una sala
app.post('/api/crearSala', (req, res) => {
  const { nombre, codigoSalaInput } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'Por favor, introduce tu nombre.' });
  }

  let codigoSala = codigoSalaInput || uuidv4();

  if (salas[codigoSala]) {
    return res.status(400).json({ error: 'La sala con este ID ya existe.' });
  }

  const jugador = { id: uuidv4(), nombre };
  salas[codigoSala] = { jugadores: [jugador] };

  console.log(`Sala creada: ${codigoSala}`); // Avisar por terminal

  res.json({ codigoSala, jugador });
});

// Manejo de conexiones de socket.io
io.on('connection', (socket) => {
  console.log('Jugador conectado: ' + socket.id);

  socket.on('unirseSala', ({ codigoSala, nombre }) => {
    console.log(`Evento unirseSala: ${nombre} intenta unirse a la sala ${codigoSala}`);
    if (!salas[codigoSala]) {
      salas[codigoSala] = { jugadores: [] };
    }
    const jugador = { id: socket.id, nombre };
    salas[codigoSala].jugadores.push(jugador);
    socket.join(codigoSala);
    console.log(`Jugador ${socket.id} (${nombre}) se unió a la sala ${codigoSala}`);

    io.to(codigoSala).emit('jugadores', salas[codigoSala].jugadores);
    io.to(codigoSala).emit('conectarSala', { mensaje: `${nombre} se ha unido a la sala.` });
  });

  socket.on('mensaje', ({ mensaje, codigoSala }) => {
    console.log(`Evento mensaje: ${mensaje} en la sala ${codigoSala} por ${socket.id}`);
    io.to(codigoSala).emit('mensaje', { mensaje, nombre: socket.id });
  });

  socket.on('salirSala', ({ codigoSala, nombre }) => {
    console.log(`Evento salirSala: ${nombre} intenta salir de la sala ${codigoSala}`);
    if (salas[codigoSala]) {
      salas[codigoSala].jugadores = salas[codigoSala].jugadores.filter(jugador => jugador.id !== socket.id);
      io.to(codigoSala).emit('jugadores', salas[codigoSala].jugadores);
      io.to(codigoSala).emit('desconectarSala', { mensaje: `${nombre} ha salido de la sala.` });

      if (salas[codigoSala].jugadores.length === 0) {
        delete salas[codigoSala];
        console.log(`Sala ${codigoSala} eliminada porque no tiene jugadores.`);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Jugador desconectado: ' + socket.id);
    for (const codigoSala in salas) {
        const sala = salas[codigoSala];
        const jugadorIndex = sala.jugadores.findIndex(jugador => jugador.id === socket.id);
        if (jugadorIndex !== -1) {
          const [jugador] = sala.jugadores.splice(jugadorIndex, 1);
          io.to(codigoSala).emit('jugadores', sala.jugadores);
          io.to(codigoSala).emit('desconectarSala', { mensaje: `Jugador ${jugador.nombre} ha salido de la sala.` });

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