const { obtenerPalabrasYDefiniciones } = require('./api');
const { crearTablero, colocarPalabraEnTablero } = require('./tablero');

const generarCrucigrama = async () => {
  console.log('Iniciando la generación del crucigrama...');
  
  const palabrasYDefiniciones = await obtenerPalabrasYDefiniciones();
  console.log(`Se obtuvieron ${palabrasYDefiniciones.length} palabras y definiciones.`);

  // Seleccionar un subconjunto aleatorio de palabras
  const palabrasSeleccionadas = palabrasYDefiniciones
    .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
    .slice(0, 20); // Seleccionar las primeras 20 palabras

  const tablero = crearTablero(10, 10);
  console.log('Tablero vacío creado.');

  palabrasSeleccionadas.forEach(({ palabra }, index) => {
    colocarPalabraEnTablero(tablero, palabra);
    console.log(`Palabra ${index + 1}/${palabrasSeleccionadas.length} colocada: ${palabra}`);
  });

  console.log('Crucigrama generado exitosamente.');
  return { tablero, pistas: palabrasSeleccionadas };
};

module.exports = { generarCrucigrama };