// api.js
const axios = require('axios');

// Función para obtener palabras desde la API de Open Multilingual Wordnet en español
const obtenerPalabras = async () => {
  try {
    const response = await axios.get('http://openwordnet-pt.org/wn/synset?lang=spa&lemma=example'); // URL de ejemplo
    return response.data.map(p => p.lemma); // Ajusta según la estructura de la respuesta de la API
  } catch (error) {
    console.error('Error al obtener palabras:', error);
    return [];
  }
};

module.exports = { obtenerPalabras };