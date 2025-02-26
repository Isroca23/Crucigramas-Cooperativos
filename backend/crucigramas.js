// crucigramas.js
const axios = require('axios');
const { crearTablero, colocarPalabraEnTablero } = require('./tablero');

const obtenerPalabras = async () => {
  const response = await axios.get('URL_DE_LA_API_DE_PALABRAS');
  return response.data; // Ajusta según la estructura de la respuesta de la API
};

const generarCrucigrama = async () => {
  const palabras = await obtenerPalabras();
  const tablero = crearTablero(10, 10); // Tamaño del tablero (10x10)

  palabras.forEach(palabra => {
    colocarPalabraEnTablero(tablero, palabra);
  });

  return { tablero, palabras };
};

module.exports = { generarCrucigrama };
