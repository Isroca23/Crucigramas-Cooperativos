const fs = require('fs');
const path = require('path');

const obtenerPalabrasYDefiniciones = async () => {
  return new Promise((resolve, reject) => {
    // Construir la ruta absoluta al archivo diccionario_array.json
    const filePath = path.join(__dirname, 'diccionario_array.json');

    // Leer el archivo JSON de forma asíncrona
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // Si ocurre un error al leer el archivo, lo registro y rechazo
        console.error('Error al leer el archivo JSON:', err);
        return reject([]);
      }

      try {
        // Parsear el contenido del archivo JSON
        const palabrasYDefiniciones = JSON.parse(data);
        resolve(palabrasYDefiniciones);
      } catch (e) {
        // Si ocurre un error al procesar el archivo, lo registro y rechazo
        console.error('Error al procesar el archivo JSON:', e);
        reject([]);
      }
    });
  });
};

// Exportar la función para que pueda ser utilizada en otros módulos
module.exports = { obtenerPalabrasYDefiniciones };