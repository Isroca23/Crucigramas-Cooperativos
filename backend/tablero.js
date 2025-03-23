const crearTablero = (filas, columnas) => {
  const tablero = [];
  for (let i = 0; i < filas; i++) {
    tablero.push(new Array(columnas).fill(null)); // Usar `null` para celdas vacías
  }
  return tablero;
};

const colocarPalabraEnTablero = (tablero, palabra) => {
  let colocada = false;
  let intentos = 0;
  const maxIntentos = 100;

  while (!colocada && intentos < maxIntentos) {
    const fila = Math.floor(Math.random() * tablero.length);
    const columna = Math.floor(Math.random() * tablero[0].length);
    const direccion = Math.random() > 0.5 ? 'horizontal' : 'vertical';

    if (puedeColocarPalabra(tablero, palabra, fila, columna, direccion)) {
      for (let i = 0; i < palabra.length; i++) {
        if (direccion === 'horizontal') {
          tablero[fila][columna + i] = palabra[i];
          if (i === palabra.length - 1 && columna + i + 1 < tablero[0].length) {
            tablero[fila][columna + i + 1] = '-'; // Agregar guión al final
          }
        } else {
          tablero[fila + i][columna] = palabra[i];
          if (i === palabra.length - 1 && fila + i + 1 < tablero.length) {
            tablero[fila + i + 1][columna] = '-'; // Agregar guión al final
          }
        }
      }
      colocada = true;
    }
    intentos++;
  }

  if (!colocada) {
    console.warn(`No se pudo colocar la palabra: ${palabra}`);
  }
};

const puedeColocarPalabra = (tablero, palabra, fila, columna, direccion) => {
  if (direccion === 'horizontal') {
    if (columna + palabra.length > tablero[0].length) return false;
    for (let i = 0; i < palabra.length; i++) {
      if (tablero[fila][columna + i] !== null && tablero[fila][columna + i] !== palabra[i]) {
        return false;
      }
    }
  } else { // dirección vertical
    if (fila + palabra.length > tablero.length) return false;
    for (let i = 0; i < palabra.length; i++) {
      if (tablero[fila + i][columna] !== null && tablero[fila + i][columna] !== palabra[i]) {
        return false;
      }
    }
  }
  return true;
};

module.exports = { crearTablero, colocarPalabraEnTablero, puedeColocarPalabra };