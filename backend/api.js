// Importar los módulos necesarios
const fs = require('fs'); // Para trabajar con el sistema de archivos
const path = require('path'); // Para manejar rutas de archivos

const obtenerPalabrasYDefiniciones = async () => {
  return new Promise((resolve, reject) => {
    // Construir la ruta absoluta al archivo Diccionario.txt
    const filePath = path.join(__dirname, 'Diccionario.txt');

    // Leer el archivo de forma asíncrona
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // Si ocurre un error al leer el archivo, lo registro y rechazo
        console.error('Error al leer el archivo:', err);
        return reject([]);
      }

      try {
        // Dividir el contenido del archivo en líneas
        const lineas = data.split('\n');

        // Procesar cada línea para extraer palabras y definiciones
        const palabrasYDefiniciones = lineas
          .map(linea => {
            // Usar una expresión regular para extraer el formato {"palabra","definición"}
            const match = linea.match(/{"([^"]+)","([^"]+)"}/);
            if (match) {
              return { palabra: match[1], definicion: match[2] };
            }
            return null; // Si no coincide el formato, devolver null
          })
          .filter(item => item !== null); // Filtrar los valores nulos

        // Resolver con el array de palabras y definiciones
        resolve(palabrasYDefiniciones);
      } catch (e) {
        // Si ocurre un error al procesar el archivo, lo registro y rechazo
        console.error('Error al procesar el archivo:', e);
        reject([]);
      }
    });
  });
};

// Exportar la función para que pueda ser utilizada en otros módulos
module.exports = { obtenerPalabrasYDefiniciones };