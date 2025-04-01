const { obtenerPalabrasYDefiniciones } = require('./api');
const { crearTablero } = require('./tablero');

const generarCrucigrama = async () => {
  console.log('Iniciando la generación del crucigrama...');

  // Crear el tablero vacío
  const tablero = crearTablero(13, 13);
  console.log('Tablero vacío de 13x13 creado.');

  // Obtener palabras y definiciones
  const palabrasYDefiniciones = await obtenerPalabrasYDefiniciones();
  console.log(`Se obtuvieron ${palabrasYDefiniciones.length} palabras y definiciones.`);

  // Ordenar palabras aleatoriamente
  let palabras = palabrasYDefiniciones.map(({ palabra }) => palabra).sort(() => Math.random() - 0.5);
  const definiciones = palabrasYDefiniciones.map(({ definicion }) => definicion);

  const pistas = [];

  // Función para verificar si una palabra puede colocarse horizontalmente
  const puedeColocarHorizontal = (fila, columna, palabra) => {
    for (let j = 0; j < palabra.length; j++) {
      const casilla = tablero[fila][columna + j];
      if (casilla !== null && casilla !== palabra[j]) {
        return false;
      }
    }
    // Verificar que el '#' al final no sobreescriba otra letra
    if (
      columna + palabra.length < tablero[0].length &&
      tablero[fila][columna + palabra.length] !== null
    ) {
      return false;
    }
    // Verificar que no haya palabras consecutivas en la misma fila
    if (
      columna > 0 &&
      tablero[fila][columna - 1] !== null
    ) {
      return false;
    }
    return true;
  };

  // Función para verificar si una palabra puede colocarse verticalmente
  const puedeColocarVertical = (fila, columna, palabra) => {
    for (let j = 0; j < palabra.length; j++) {
      const casilla = tablero[fila + j][columna];
      if (casilla !== null && casilla !== palabra[j]) {
        return false;
      }
    }
    // Verificar que el '#' al final no sobreescriba otra letra
    if (
      fila + palabra.length < tablero.length &&
      tablero[fila + palabra.length][columna] !== null
    ) {
      return false;
    }
    // Verificar que no haya palabras consecutivas en la misma columna
    if (
      fila > 0 &&
      tablero[fila - 1][columna] !== null
    ) {
      return false;
    }
    return true;
  };

  // Colocar palabras horizontalmente
  let filaActual = 0;
  while (filaActual < tablero.length && palabras.length > 0) {
    for (let i = 0; i < palabras.length; i++) {
      const palabra = palabras[i];

      if (palabra.length <= tablero[0].length) {
        let columnaInicio = 0;
        while (columnaInicio + palabra.length <= tablero[0].length) {
          if (puedeColocarHorizontal(filaActual, columnaInicio, palabra)) {
            // Colocar la palabra
            for (let j = 0; j < palabra.length; j++) {
              tablero[filaActual][columnaInicio + j] = palabra[j];
            }

            // Agregar un '#' al final si no es el final de la fila
            if (
              columnaInicio + palabra.length < tablero[0].length &&
              tablero[filaActual][columnaInicio + palabra.length] === null
            ) {
              tablero[filaActual][columnaInicio + palabra.length] = '#';
            }

            console.log(`Palabra colocada horizontalmente: "${palabra}" en fila ${filaActual}, columna ${columnaInicio}`);
            pistas.push({ palabra, definicion: definiciones[i], orientacion: 'horizontal', fila: filaActual });

            // Eliminar la palabra para que no se vuelva a usar
            palabras.splice(i, 1);
            definiciones.splice(i, 1);
            i--; // Ajustar índice tras eliminar
            break;
          }

          columnaInicio++;
        }
      }
    }
    filaActual += 4; // Saltar 3 filas
  }

  // Colocar palabras verticalmente
  let columnaActual = 0;
  while (columnaActual < tablero[0].length && palabras.length > 0) {
    for (let i = 0; i < palabras.length; i++) {
      const palabra = palabras[i];

      if (palabra.length <= tablero.length) {
        let filaInicio = 0;
        while (filaInicio + palabra.length <= tablero.length) {
          if (puedeColocarVertical(filaInicio, columnaActual, palabra)) {
            // Colocar la palabra
            for (let j = 0; j < palabra.length; j++) {
              tablero[filaInicio + j][columnaActual] = palabra[j];
            }

            // Agregar un '#' al final si no es el final de la columna
            if (
              filaInicio + palabra.length < tablero.length &&
              tablero[filaInicio + palabra.length][columnaActual] === null
            ) {
              tablero[filaInicio + palabra.length][columnaActual] = '#';
            }

            console.log(`Palabra colocada verticalmente: "${palabra}" en columna ${columnaActual}, fila ${filaInicio}`);
            pistas.push({ palabra, definicion: definiciones[i], orientacion: 'vertical', columna: columnaActual });

            // Eliminar la palabra para que no se vuelva a usar
            palabras.splice(i, 1);
            definiciones.splice(i, 1);
            i--; // Ajustar índice tras eliminar
            break;
          }

          filaInicio++;
        }
      }
    }
    columnaActual += 4; // Saltar 3 columnas
  }

  // Convertir espacios vacíos en casillas negras (#)
  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[i].length; j++) {
      if (tablero[i][j] === null) {
        tablero[i][j] = '#';
      }
    }
  }

  console.log('Crucigrama generado exitosamente.');
  return { tablero, pistas };
};

module.exports = { generarCrucigrama };