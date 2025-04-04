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

  const puedeColocarHorizontal = (fila, columna, palabra) => {
    // Verificar casilla antes de la palabra
    if (columna > 0 && tablero[fila][columna - 1] !== null && tablero[fila][columna - 1] !== '#') {
      return false;
    }
  
    // Verificar casillas de la palabra
    for (let j = 0; j < palabra.length; j++) {
      const casilla = tablero[fila][columna + j];
      if (casilla !== null && casilla !== palabra[j]) {
        return false;
      }
    }
  
    // Verificar casilla después de la palabra
    if (
      columna + palabra.length < tablero[0].length &&
      tablero[fila][columna + palabra.length] !== null &&
      tablero[fila][columna + palabra.length] !== '#'
    ) {
      return false;
    }
  
    return true;
  };
  
  const puedeColocarVertical = (fila, columna, palabra) => {
    // Verificar casilla antes de la palabra
    if (fila > 0 && tablero[fila - 1][columna] !== null && tablero[fila - 1][columna] !== '#') {
      return false;
    }
  
    // Verificar casillas de la palabra
    for (let j = 0; j < palabra.length; j++) {
      const casilla = tablero[fila + j][columna];
      if (casilla !== null && casilla !== palabra[j]) {
        return false;
      }
    }
  
    // Verificar casilla después de la palabra
    if (
      fila + palabra.length < tablero.length &&
      tablero[fila + palabra.length][columna] !== null &&
      tablero[fila + palabra.length][columna] !== '#'
    ) {
      return false;
    }
  
    return true;
  };

  // Función genérica para colocar palabras en una dirección (horizontal o vertical)
  const colocarPalabras = (esHorizontal, inicio, limite, puedeColocar, colocarPalabra) => {
    let actual = inicio;
    while (actual < limite && palabras.length > 0) {
      for (let i = 0; i < palabras.length; i++) {
        const palabra = palabras[i];
        const maxLongitud = esHorizontal ? tablero[0].length : tablero.length;

        if (palabra.length <= maxLongitud) {
          let posicionInicio = 0;
          while (posicionInicio + palabra.length <= maxLongitud) {
            // Ajustar los parámetros según la orientación
            const fila = esHorizontal ? actual : posicionInicio;
            const columna = esHorizontal ? posicionInicio : actual;

            if (puedeColocar(fila, columna, palabra)) {
              colocarPalabra(fila, columna, palabra);

              // Colocar '#' al principio si no es el borde del tablero
              if (esHorizontal) {
                if (columna > 0) tablero[fila][columna - 1] = '#';
                if (columna + palabra.length < tablero[0].length) {
                  tablero[fila][columna + palabra.length] = '#';
                }
              } else {
                if (fila > 0) tablero[fila - 1][columna] = '#';
                if (fila + palabra.length < tablero.length) {
                  tablero[fila + palabra.length][columna] = '#';
                }
              }

              console.log(
                `Palabra colocada ${esHorizontal ? 'horizontalmente' : 'verticalmente'}: "${palabra}" en ${esHorizontal ? 'fila' : 'columna'} ${actual}, ${esHorizontal ? 'columna' : 'fila'} ${posicionInicio}`
              );
              pistas.push({
                palabra,
                definicion: definiciones[i],
                orientacion: esHorizontal ? 'horizontal' : 'vertical',
                [esHorizontal ? 'fila' : 'columna']: actual,
              });

              // Eliminar la palabra para que no se vuelva a usar
              palabras.splice(i, 1);
              definiciones.splice(i, 1);
              i--;
              break;
            }
            posicionInicio++;
          }
        }
      }
      actual += 4;
    }
  };

  // Colocar palabras
  colocarPalabras(
    true,
    0,
    tablero.length,
    puedeColocarHorizontal,
    (fila, columna, palabra) => {
      for (let j = 0; j < palabra.length; j++) {
        tablero[fila][columna + j] = palabra[j];
      }
      if (
        columna + palabra.length < tablero[0].length &&
        tablero[fila][columna + palabra.length] === null
      ) {
        tablero[fila][columna + palabra.length] = '#';
      }
    }
  );

  colocarPalabras(
    false, 
    0,
    tablero[0].length,
    puedeColocarVertical,
    (fila, columna, palabra) => {
      for (let j = 0; j < palabra.length; j++) {
        tablero[fila + j][columna] = palabra[j];
      }
      if (
        fila + palabra.length < tablero.length &&
        tablero[fila + palabra.length][columna] === null
      ) {
        tablero[fila + palabra.length][columna] = '#';
      }
    }
  );

  colocarPalabras(
    true,
    2,
    tablero.length,
    puedeColocarHorizontal,
    (fila, columna, palabra) => {
      for (let j = 0; j < palabra.length; j++) {
        tablero[fila][columna + j] = palabra[j];
      }
      if (
        columna + palabra.length < tablero[0].length &&
        tablero[fila][columna + palabra.length] === null
      ) {
        tablero[fila][columna + palabra.length] = '#';
      }
    }
  );

  colocarPalabras(
    false,
    2,
    tablero[0].length,
    puedeColocarVertical,
    (fila, columna, palabra) => {
      for (let j = 0; j < palabra.length; j++) {
        tablero[fila + j][columna] = palabra[j];
      }
      if (
        fila + palabra.length < tablero.length &&
        tablero[fila + palabra.length][columna] === null
      ) {
        tablero[fila + palabra.length][columna] = '#';
      }
    }
  );

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