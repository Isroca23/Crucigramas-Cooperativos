const { crearSala, unirseSala, salirSala, manejarDesconexion, generarCrucigrama, actualizarCasilla } = require('./salas');

const configureSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Jugador conectado: ${socket.id}`);

    socket.on('crearSala', (data, callback) => crearSala(socket, data, callback));
    socket.on('unirseSala', (data, callback) => unirseSala(socket, data, callback));
    socket.on('generarCrucigrama', (data, callback) => generarCrucigrama(socket, data, callback));
    socket.on('actualizarCasilla', (data) => actualizarCasilla(socket, data));
    socket.on('salirSala', (data) => salirSala(socket, data));
    socket.on('disconnect', () => manejarDesconexion(socket));
  });
};

module.exports = { configureSocketHandlers };
