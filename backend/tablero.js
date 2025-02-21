// tablero.js

// Función para crear un tablero vacío
const crearTablero = (filas, columnas) => {
    const tablero = [];
    for (let i = 0; i < filas; i++) {
      tablero.push(new Array(columnas).fill('')); // Llenar el tablero con cadenas vacías
    }
    return tablero;
  };
  
  // Función para colocar una palabra en el tablero
  const colocarPalabraEnTablero = (tablero, palabra) => {
    const direccion = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    let colocada = false;
  
    while (!colocada) {
      const fila = Math.floor(Math.random() * tablero.length);
      const columna = Math.floor(Math.random() * tablero[0].length);
      
      if (puedeColocarPalabra(tablero, palabra, fila, columna, direccion)) {
        for (let i = 0; i < palabra.length; i++) {
          if (direccion === 'horizontal') {
            tablero[fila][columna + i] = palabra[i];
          } else {
            tablero[fila + i][columna] = palabra[i];
          }
        }
        colocada = true;
      }
    }
  };
  
  // Función para verificar si se puede colocar la palabra en la posición
  const puedeColocarPalabra = (tablero, palabra, fila, columna, direccion) => {
    if (direccion === 'horizontal') {
      if (columna + palabra.length > tablero[0].length) return false;
      for (let i = 0; i < palabra.length; i++) {
        if (tablero[fila][columna + i] !== '') return false;
      }
    } else { // dirección vertical
      if (fila + palabra.length > tablero.length) return false;
      for (let i = 0; i < palabra.length; i++) {
        if (tablero[fila + i][columna] !== '') return false;
      }
    }
    return true;
  };
  
  module.exports = { crearTablero, colocarPalabraEnTablero, puedeColocarPalabra };
  