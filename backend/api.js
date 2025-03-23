const fs = require('fs');
const path = require('path');

const obtenerPalabrasYDefiniciones = async () => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'Diccionario.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        return reject([]);
      }

      try {
        const lineas = data.split('\n');
        const palabrasYDefiniciones = lineas.map(linea => {
          const match = linea.match(/{"([^"]+)","([^"]+)"}/);
          if (match) {
            return { palabra: match[1], definicion: match[2] };
          }
          return null;
        }).filter(item => item !== null);

        // Seleccionar un subconjunto aleatorio de palabras
        const palabrasSeleccionadas = palabrasYDefiniciones
          .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
          .slice(0, 20); // Seleccionar las primeras 20 palabras

        resolve(palabrasSeleccionadas);
      } catch (e) {
        console.error('Error al procesar el archivo:', e);
        reject([]);
      }
    });
  });
};

module.exports = { obtenerPalabrasYDefiniciones };