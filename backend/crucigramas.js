// crucigramas.js
const { obtenerPalabras } = require('./api');
const { crearTablero, colocarPalabraEnTablero } = require('./tablero');

const generarCrucigrama = async () => {
  const palabras = await obtenerPalabras();
  const tablero = crearTablero(10, 10);

  palabras.forEach(palabra => {
    colocarPalabraEnTablero(tablero, palabra);
  });

  return { tablero, palabras };
};

module.exports = { generarCrucigrama };