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

        resolve(palabrasYDefiniciones);
      } catch (e) {
        console.error('Error al procesar el archivo:', e);
        reject([]);
      }
    });
  });
};

module.exports = { obtenerPalabrasYDefiniciones };