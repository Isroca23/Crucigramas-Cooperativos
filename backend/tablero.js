const crearTablero = (filas, columnas) => {
  const tablero = [];
  for (let i = 0; i < filas; i++) {
    tablero.push(new Array(columnas).fill(null)); // Usar `null` para celdas vacías
  }
  return tablero;
};

const colocarCasillasNegras = (tablero) => {
  const totalCasillas = tablero.length * tablero[0].length;
  const numCasillasNegras = Math.floor(Math.random() * 11) + 10; // Entre 10 y 20 casillas negras

  let colocadas = 0;
  while (colocadas < numCasillasNegras) {
    const fila = Math.floor(Math.random() * tablero.length);
    const columna = Math.floor(Math.random() * tablero[0].length);

    if (tablero[fila][columna] === null && !tieneCasillasConsecutivas(tablero, fila, columna)) {
      tablero[fila][columna] = 'X'; // Usar 'X' para casillas negras
      colocadas++;
    }
  }
};

const tieneCasillasConsecutivas = (tablero, fila, columna) => {
  const direcciones = [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ];

  for (const [dx, dy] of direcciones) {
    const nuevaFila = fila + dx;
    const nuevaColumna = columna + dy;

    if (
      nuevaFila >= 0 && nuevaFila < tablero.length &&
      nuevaColumna >= 0 && nuevaColumna < tablero[0].length &&
      tablero[nuevaFila][nuevaColumna] === 'X'
    ) {
      return true;
    }
  }
  return false;
};

const obtenerEspaciosDisponibles = (tablero) => {
  const espacios = { horizontal: [], vertical: [] };

  // Buscar espacios horizontales
  for (let i = 0; i < tablero.length; i++) {
    let espacio = [];
    for (let j = 0; j < tablero[i].length; j++) {
      if (tablero[i][j] === null) {
        espacio.push([i, j]);
      } else if (espacio.length > 1) {
        espacios.horizontal.push(espacio);
        espacio = [];
      } else {
        espacio = [];
      }
    }
    if (espacio.length > 1) {
      espacios.horizontal.push(espacio);
    }
  }

  // Buscar espacios verticales
  for (let j = 0; j < tablero[0].length; j++) {
    let espacio = [];
    for (let i = 0; i < tablero.length; i++) {
      if (tablero[i][j] === null) {
        espacio.push([i, j]);
      } else if (espacio.length > 1) {
        espacios.vertical.push(espacio);
        espacio = [];
      } else {
        espacio = [];
      }
    }
    if (espacio.length > 1) {
      espacios.vertical.push(espacio);
    }
  }

  return espacios;
};

const colocarPalabraEnEspacio = (tablero, palabra, espacio) => {
  for (let i = 0; i < palabra.length; i++) {
    const [fila, columna] = espacio[i];
    tablero[fila][columna] = palabra[i];
  }
};

module.exports = { crearTablero, colocarCasillasNegras, obtenerEspaciosDisponibles, colocarPalabraEnEspacio };