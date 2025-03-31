// Función para crear un tablero vacío con las dimensiones especificadas
const crearTablero = (filas, columnas) => {
  const tablero = [];
  for (let i = 0; i < filas; i++) {
    tablero.push(new Array(columnas).fill(null)); // Usar null para casillas vacías
  }
  return tablero;
};

// Función para colocar casillas null en el tablero de forma aleatoria
const colocarCasillasNull = (tablero, probabilidad = 0.2) => {
  // La probabilidad determina qué porcentaje de casillas serán null (por defecto 20%)
  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[i].length; j++) {
      // Generar una casilla null con la probabilidad especificada
      if (Math.random() < probabilidad) {
        tablero[i][j] = '#';
      }
    }
  }
};

// Función auxiliar para verificar si una casilla null generaría casillas consecutivas
// const tieneCasillasConsecutivas = (tablero, fila, columna) => {
//   const direcciones = [
//     [0, 1], [1, 0], [0, -1], [-1, 0]
//   ];

//   for (const [dx, dy] of direcciones) {
//     const nuevaFila = fila + dx;
//     const nuevaColumna = columna + dy;

//     // Verificar si la casilla adyacente está dentro de los límites y es null
//     if (
//       nuevaFila >= 0 && nuevaFila < tablero.length &&
//       nuevaColumna >= 0 && nuevaColumna < tablero[0].length &&
//       tablero[nuevaFila][nuevaColumna] === ' '
//     ) {
//       return true;
//     }
//   }
//   return false;
// };

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
  // Verificar si todas las casillas del espacio están vacías o coinciden con las letras de la palabra
  for (let i = 0; i < palabra.length; i++) {
    const [fila, columna] = espacio[i];
    if (tablero[fila][columna] !== null && tablero[fila][columna] !== palabra[i]) {
      return false; // El espacio no es válido
    }
  }

  // Colocar la palabra en el espacio
  for (let i = 0; i < palabra.length; i++) {
    const [fila, columna] = espacio[i];
    tablero[fila][columna] = palabra[i];
  }

  return true; // La palabra se colocó correctamente
};

module.exports = { crearTablero, colocarCasillasNull, obtenerEspaciosDisponibles, colocarPalabraEnEspacio };