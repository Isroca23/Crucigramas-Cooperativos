const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { generarCrucigrama } = require('./crucigramas');
const { actualizarEstadisticas } = require('./estadisticas');
const { calcularEstadisticas } = require('./estadisticas');

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

// Evento de conexión de jugadores
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
    io.to(data.codigoSala).emit('letra', data); // Emitimos la letra a todos los jugadores de la sala
    // Actualizamos las estadísticas al enviar la letra
    actualizarEstadisticas(data.jugador, data.letra, data.posicion, data.esCorrecto);
  });

  // Evento de desconexión
  socket.on('disconnect', () => {
    for (let sala in salas) {
      const index = salas[sala].jugadores.indexOf(socket.id);
      if (index !== -1) {
        salas[sala].jugadores.splice(index, 1);
        io.to(sala).emit('jugadores', salas[sala].jugadores);
        console.log(`Jugador ${socket.id} desconectado de la sala ${sala}`);
        break;
      }
    }
  });

  // Enviar estadísticas al final de la partida
  socket.on('fin-partida', () => {
    const estadisticas = calcularEstadisticas(salas);
    socket.emit('estadisticas', estadisticas);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Página de bienvenida
app.get('/', (req, res) => {
  res.send('Juego de crucigramas');
});
