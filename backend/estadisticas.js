// estadisticas.js

let jugadoresStats = {}; // Almacena el rendimiento de los jugadores

// Función para actualizar las estadísticas
const actualizarEstadisticas = (jugador, letra, posicion, esCorrecto) => {
  if (!jugadoresStats[jugador]) {
    jugadoresStats[jugador] = { aciertos: 0, fallos: 0, completadas: 0 };
  }

  if (esCorrecto) {
    jugadoresStats[jugador].aciertos++;
  } else {
    jugadoresStats[jugador].fallos++;
  }

  // Verificar si el jugador ha completado una palabra
  if (esPalabraCompleta(posicion)) {
    jugadoresStats[jugador].completadas++;
  }

  return jugadoresStats;
};

// Función para determinar si una palabra se ha completado (simulada)
const esPalabraCompleta = (posicion) => {
  // Lógica de comprobación (puede variar según la implementación)
  return Math.random() > 0.5; // Simulando un 50% de probabilidad
};

// Función para calcular las estadísticas finales
const calcularEstadisticas = () => {
  const resultados = Object.keys(jugadoresStats).map(jugador => {
    return {
      jugador,
      ...jugadoresStats[jugador]
    };
  });

  // Ordenar por aciertos, fallos y palabras completadas
  resultados.sort((a, b) => b.aciertos - a.aciertos);  // Primero por aciertos
  return resultados;
};

module.exports = { actualizarEstadisticas, calcularEstadisticas };
