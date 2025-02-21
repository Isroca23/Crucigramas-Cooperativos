// crucigramas.js
const { obtenerPalabras } = require('./api');
const { crearTablero, colocarPalabraEnTablero } = require('./tablero');

// Función para generar el crucigrama
const generarCrucigrama = async () => {
  const palabras = await obtenerPalabras();
  const tablero = crearTablero(10, 10); // Tamaño del tablero (10x10)

  palabras.forEach(palabra => {
    colocarPalabraEnTablero(tablero, palabra);
  });

  return { tablero, palabras };
};

module.exports = { generarCrucigrama };
