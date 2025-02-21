// api.js
const axios = require('axios');

// Función para obtener palabras desde la API
const obtenerPalabras = async () => {
  try {
    const response = await axios.get('https://api.datamuse.com/words?max=10'); // API de ejemplo
    return response.data.map(p => p.word); // Extraer palabras
  } catch (error) {
    console.error('Error al obtener palabras:', error);
    return [];
  }
};

module.exports = { obtenerPalabras };
