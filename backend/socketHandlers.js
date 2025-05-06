const { inicializarIO, crearSala, unirseSala, salirSala, manejarDesconexion, generarCrucigrama, actualizarCasilla, guardarConfiguracion } = require('./salas');

const configureSocketHandlers = (io) => {
  inicializarIO(io);

  io.on('connection', (socket) => {
    socket.on('crearSala', (data, callback) => crearSala(socket, data, callback));
    socket.on('unirseSala', (data, callback) => unirseSala(socket, data, callback));
    socket.on('generarCrucigrama', (data, callback) => generarCrucigrama(socket, data, callback));
    socket.on('actualizarCasilla', (data) => actualizarCasilla(socket, data));
    socket.on('guardarConfiguracion', (data, callback) => guardarConfiguracion(socket, data, callback));
    socket.on('salirSala', (data) => salirSala(socket, data));
    socket.on('disconnect', () => manejarDesconexion(socket));
  });
};

module.exports = { configureSocketHandlers };
