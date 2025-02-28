const express = require('express');
const http = require('http');
const cors = require('cors');
const { generarCrucigrama } = require('./crucigramas');
const { actualizarEstadisticas } = require('./estadisticas');
const { calcularEstadisticas } = require('./estadisticas');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Inicializar socket.io
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:3000"
   // Allow requests from this origin
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

io.on('connection', (socket) => {
  console.log('Jugador conectado: ' + socket.id);

  socket.on('unirseSala', (data) => {
    const { codigoSala, nombre } = data;
    if (!salas[codigoSala]) {
      socket.emit('error', 'La sala no existe');
      return;
    }

    const jugador = { id: socket.id, nombre: nombre || `Jugador ${socket.id}` };
    salas[codigoSala].jugadores.push(jugador);
    socket.join(codigoSala);
    console.log(`Jugador ${socket.id} (${nombre}) se unió a la sala ${codigoSala}`);

    io.to(codigoSala).emit('jugadores', salas[codigoSala].jugadores);
  });

  socket.on('mensaje', (data) => {
    const { mensaje, codigoSala } = data;
    io.to(codigoSala).emit('mensaje', { id: socket.id, mensaje });
  });

  socket.on('disconnect', () => {
    let salaVacia = false;
    for (const codigoSala in salas) {
      const index = salas[codigoSala].jugadores.findIndex(jugador => jugador.id === socket.id);
      if (index !== -1) {
        salas[codigoSala].jugadores.splice(index, 1);
        io.to(codigoSala).emit('jugadores', salas[codigoSala].jugadores);
        console.log(`Jugador desconectado: ${socket.id}`);

        if (salas[codigoSala].jugadores.length === 0) {
          delete salas[codigoSala];
          console.log(`Sala ${codigoSala} eliminada por falta de jugadores`);
          salaVacia = true;
        }
        break;
      }
    }
    if (!salaVacia) {
      console.log(`Jugador desconectado: ${socket.id}`);
    }
  });
});

server.listen(5000, () => {
  console.log('Servidor escuchando en puerto 5000');
});