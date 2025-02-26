const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { generarCrucigrama } = require('./crucigramas');
const { actualizarEstadisticas } = require('./estadisticas');
const { calcularEstadisticas } = require('./estadisticas');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// Almacenamos las salas en memoria (esto se puede modificar para usar una base de datos si fuera necesario)
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
  const codigoSala = uuidv4();
  salas[codigoSala] = { jugadores: [] };
  res.json({ codigoSala });
});

io.on('connection', (socket) => {
  console.log('Jugador conectado: ' + socket.id);

  // Unirse a una sala
  socket.on('unirseSala', (codigoSala) => {
    if (!salas[codigoSala]) {
      salas[codigoSala] = { jugadores: [] };
    }

    salas[codigoSala].jugadores.push(socket.id);
    socket.join(codigoSala);
    console.log(`Jugador ${socket.id} se unió a la sala ${codigoSala}`);

    // Enviar lista de jugadores actuales a todos los miembros de la sala
    io.to(codigoSala).emit('jugadores', salas[codigoSala].jugadores);
  });

  // Enviar letra a todos los jugadores de la sala
  socket.on('letra', (data) => {
    const { letra, codigoSala } = data;
    io.to(codigoSala).emit('letra', letra);
  });

  // Evento de desconexión
  socket.on('disconnect', () => {
    for (const codigoSala in salas) {
      const index = salas[codigoSala].jugadores.indexOf(socket.id);
      if (index !== -1) {
        salas[codigoSala].jugadores.splice(index, 1);
        io.to(codigoSala).emit('jugadores', salas[codigoSala].jugadores);
        break;
      }
    }
  });
});

server.listen(5000, () => {
  console.log('Servidor escuchando en puerto 5000');
});
