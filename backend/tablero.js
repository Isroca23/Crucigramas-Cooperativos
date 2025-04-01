const crearTablero = (filas, columnas) => {
  return Array.from({ length: filas }, () => Array(columnas).fill(null));
};

module.exports = { crearTablero };