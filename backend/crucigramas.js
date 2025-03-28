const { obtenerPalabrasYDefiniciones } = require('./api');
const { crearTablero, colocarCasillasNegras, obtenerEspaciosDisponibles, colocarPalabraEnEspacio } = require('./tablero');

// Función para renderizar el tablero, convirtiendo `null` en un espacio visual
const renderizarTablero = (tablero) => {
  return tablero.map(fila =>
    fila.map(casilla => (casilla === null ? '#' : casilla)).join(' ')
  ).join('\n');
};

const generarCrucigrama = async () => {
  console.log('Iniciando la generación del crucigrama...');
  
  const palabrasYDefiniciones = await obtenerPalabrasYDefiniciones();
  console.log(`Se obtuvieron ${palabrasYDefiniciones.length} palabras y definiciones.`);

  const tablero = crearTablero(10, 10);
  console.log('Tablero vacío de 10x10 creado.');

  colocarCasillasNegras(tablero);
  console.log('Casillas negras colocadas en el tablero.');

  const espacios = obtenerEspaciosDisponibles(tablero);
  console.log(`Espacios disponibles determinados: ${espacios.horizontal.length} horizontales y ${espacios.vertical.length} verticales.`);

const pistas = [];
let index = 0;

while (espacios.horizontal.length > 0 || espacios.vertical.length > 0) {
  let espacio;
  if (index % 2 === 0) {
    espacio = espacios.vertical.shift() || espacios.horizontal.shift();
  } else {
    espacio = espacios.horizontal.shift() || espacios.vertical.shift();
  }
  if (!espacio) continue;

  const longitud = espacio.length;
  const posiblesPalabras = palabrasYDefiniciones.filter(({ palabra }) => palabra.length === longitud);

  if (posiblesPalabras.length > 0) {
    const { palabra, definicion } = posiblesPalabras[Math.floor(Math.random() * posiblesPalabras.length)];
    const palabraColocada = colocarPalabraEnEspacio(tablero, palabra, espacio);
  
    if (palabraColocada) {
      pistas.push({ palabra, definicion });
      palabrasYDefiniciones.splice(palabrasYDefiniciones.indexOf({ palabra, definicion }), 1);
  
      const posicion = espacio[0][1] === espacio[1][1] ? `columna ${espacio[0][1]}` : `fila ${espacio[0][0]}`;
      console.log(`Palabra "${palabra}" colocada en el espacio de longitud ${longitud} en la ${posicion}.`);
    
      console.log('Estado actual del tablero:');
      console.table(renderizarTablero(tablero));
    } else {
      console.log(`El espacio no es válido para la palabra "${palabra}".`);
    }
  } else {
    console.log(`No se encontraron palabras para el espacio de longitud ${longitud}.`);
  }

  index++;
}

console.log('Crucigrama generado exitosamente.');
return { tablero, pistas };
};

module.exports = { generarCrucigrama };