const estadisticasSalas = {};

const inicializarEstadisticas = (codigoSala, jugadorId) => {
  if (!estadisticasSalas[codigoSala]) {
    estadisticasSalas[codigoSala] = {};
  }
  
  if (!estadisticasSalas[codigoSala][jugadorId]) {
    estadisticasSalas[codigoSala][jugadorId] = {
      puntosCasillas: 0,
      puntosPalabras: 0,
      palabrasCompletadas: [],
      casillasCompletadas: new Set(),
      total: 0
    };
  }

  return estadisticasSalas[codigoSala][jugadorId];
};

const actualizarPuntosCasilla = (codigoSala, jugadorId, fila, columna) => {
  const stats = inicializarEstadisticas(codigoSala, jugadorId);
  const casilla = `${fila}-${columna}`;
  
  if (!stats.casillasCompletadas.has(casilla)) {
    stats.casillasCompletadas.add(casilla);
    stats.puntosCasillas += 1;
    stats.total += 1;
    return true;
  }
  return false;
};

const actualizarPuntosPalabra = (codigoSala, jugadorId, palabra, longitud) => {
  const stats = estadisticasSalas[codigoSala][jugadorId];
  
  if (!stats.palabrasCompletadas.includes(palabra)) {
    stats.palabrasCompletadas.push(palabra);
    stats.puntosPalabras += longitud;
    stats.total += longitud;
    return true;
  }
  return false;
};

const obtenerEstadisticasSala = (codigoSala) => {
  return estadisticasSalas[codigoSala] || {};
};

const reiniciarEstadisticasSala = (codigoSala) => {
  if (estadisticasSalas[codigoSala]) {
    Object.keys(estadisticasSalas[codigoSala]).forEach(jugadorId => {
      estadisticasSalas[codigoSala][jugadorId] = {
        puntosCasillas: 0,
        puntosPalabras: 0,
        palabrasCompletadas: [],
        casillasCompletadas: new Set(),
        total: 0
      };
    });
  }
};

const eliminarEstadisticasJugador = (codigoSala, jugadorId) => {
  if (estadisticasSalas[codigoSala]) {
    delete estadisticasSalas[codigoSala][jugadorId];
  }
};

module.exports = {
  inicializarEstadisticas,
  actualizarPuntosCasilla,
  actualizarPuntosPalabra,
  obtenerEstadisticasSala,
  reiniciarEstadisticasSala,
  eliminarEstadisticasJugador
};