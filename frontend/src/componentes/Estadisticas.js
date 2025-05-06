import React, { useState } from 'react';
import { ReactComponent as InfoIcon } from '../img/Info.svg';

const Estadisticas = ({ estadisticas, jugadores, socketId, onSeleccionarPalabra }) => {
  const [jugadoresExpandidos, setJugadoresExpandidos] = useState(new Set());

  const toggleJugador = (id) => {
    const nuevosExpandidos = new Set(jugadoresExpandidos);
    if (nuevosExpandidos.has(id)) {
      nuevosExpandidos.delete(id);
    } else {
      nuevosExpandidos.add(id);
    }
    setJugadoresExpandidos(nuevosExpandidos);
  };

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2>Tabla de puntuaciones</h2>
        <div className="stats-info">
          <InfoIcon className="info-icon" />
          <div className="stats-tooltip">
            <h4>Sistema de puntuación:</h4>
            <ul>
              <li>+1 punto por cada casilla correcta</li>
              <li>+N puntos por completar una palabra de N letras</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="stats-list">
        {jugadores
          .sort((a, b) => {
            const statsA = estadisticas[a.id] || { total: 0 };
            const statsB = estadisticas[b.id] || { total: 0 };
            return statsB.total - statsA.total;
          })
          .map((jugador, index) => {
            const statsJugador = estadisticas[jugador.id] || {
              puntosCasillas: 0,
              puntosPalabras: 0,
              palabrasCompletadas: [],
              total: 0
            };
    
          const isExpanded = jugadoresExpandidos.has(jugador.id);

          return (
            <div key={jugador.id} className="stats-player-card">
              <div className="stats-player-header" onClick={() => toggleJugador(jugador.id)}>
                <div className="stats-player-info">
                  <span className="stats-position">{index + 1}</span>
                  <span className="stats-name">
                    {jugador.nombre}
                    {jugador.id === socketId && <span className="tag-you">(Tú)</span>}
                  </span>
                </div>
                <span className="stats-player-score">{statsJugador.total} pts</span>
              </div>
              
              {isExpanded && (
                <div className="stats-player-details">
                  <div className="stats-points-breakdown">
                    <div>
                      <span>Casillas completadas:</span>
                      <span>{statsJugador.puntosCasillas} pts</span>
                    </div>
                    <div>
                      <span>Palabras completadas:</span>
                      <span>{statsJugador.puntosPalabras} pts</span>
                    </div>
                  </div>
                  {statsJugador.palabrasCompletadas?.length > 0 && (
                    <div className="stats-words">
                      <h5>Palabras completadas:</h5>
                      <div className="stats-words-list">
                    {statsJugador.palabrasCompletadas.length > 0 ? (
                      statsJugador.palabrasCompletadas.map((palabra, index) => (
                        <span
                          key={index}
                          className="stats-word-tag"
                          onClick={() => onSeleccionarPalabra(palabra)}
                        >
                          {palabra}
                        </span>
                      ))
                    ) : (
                      <span className="stats-word-tag">Ninguna</span>
                    )}
                  </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  </div>
);
};

export default Estadisticas;