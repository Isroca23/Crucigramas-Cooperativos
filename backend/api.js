const { exec } = require('child_process');

const obtenerPalabras = async () => {
  return new Promise((resolve, reject) => {
    exec('python obtener_palabras.py', (error, stdout, stderr) => {
      if (error) {
        console.error('Error al obtener palabras:', error);
        return reject([]);
      }
      try {
        const palabras = JSON.parse(stdout);
        resolve(palabras);
      } catch (e) {
        console.error('Error al parsear palabras:', e);
        reject([]);
      }
    });
  });
};

module.exports = { obtenerPalabras };