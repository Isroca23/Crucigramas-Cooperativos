import React, { useState, useEffect } from 'react';
import './App.css';
import { io } from 'socket.io-client';
import axios from 'axios';

// Conectar al servidor de socket.io
const socket = io('http://localhost:5000');

function App() {
  const [crucigrama, setCrucigrama] = useState(null);
  const [letra, setLetra] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [codigoSala, setCodigoSala] = useState('');
  const [codigoSalaInput, setCodigoSalaInput] = useState('');
  const [tablero, setTablero] = useState([]);
  const [palabrasCompletadas, setPalabrasCompletadas] = useState({});
  const [estadisticas, setEstadisticas] = useState(null); // Estadísticas de la partida

  useEffect(() => {
    // Obtener el crucigrama desde el backend al cargar
    axios.get('http://localhost:5000/api/generar')
      .then(response => {
        setCrucigrama(response.data);
        setTablero(response.data.tablero);
      })
      .catch(error => console.log(error));

    // Escuchar cambios en los jugadores y estadísticas
    socket.on('jugadores', (jugadores) => {
      setJugadores(jugadores);
    });

    socket.on('estadisticas', (estadisticas) => {
      setEstadisticas(estadisticas); // Recibir y actualizar las estadísticas
    });

    return () => {
      socket.off('jugadores');
      socket.off('estadisticas');
    };
  }, []);

  // Función para enviar letra
  const enviarLetra = () => {
    if (codigoSala && letra) {
      socket.emit('letra', { letra, codigoSala });
      setLetra('');
    }
  };

  // Función para unirse a una sala
  const unirseSala = () => {
    if (codigoSalaInput) {
      setCodigoSala(codigoSalaInput);
      socket.emit('unirseSala', codigoSalaInput);
    }
  };

  // Mostrar estadísticas al final de la partida
  const mostrarEstadisticas = () => {
    if (estadisticas) {
      return (
        <div>
          <h2>Estadísticas Finales</h2>
          <ul>
            {Object.keys(estadisticas).map(jugador => (
              <li key={jugador}>
                {jugador}: <br />
                Aciertos: {estadisticas[jugador].aciertos} <br />
                Fallos: {estadisticas[jugador].fallos} <br />
                Palabras Completadas: {estadisticas[jugador].completadas}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <h1>Crucigrama Cooperativo</h1>

      {!codigoSala ? (
        <div>
          <h2>Unirse a una Sala</h2>
          <input
            type="text"
            value={codigoSalaInput}
            onChange={(e) => setCodigoSalaInput(e.target.value)}
            className="border p-2"
            placeholder="Código de sala"
          />
          <button onClick={unirseSala} className="bg-blue-500 text-white p-2">
            Unirse
          </button>
        </div>
      ) : (
        <div>
          <h2>Jugadores en la Sala:</h2>
          <ul>
            {jugadores.map((jugador, index) => (
              <li key={index}>{jugador}</li>
            ))}
          </ul>

          <h2>Tablero:</h2>
          <div className="grid grid-cols-10 gap-1">
            {tablero.map((fila, filaIndex) => (
              <div key={filaIndex} className="flex">
                {fila.map((celda, columnaIndex) => (
                  <div key={columnaIndex} className="w-10 h-10 border flex items-center justify-center">
                    {palabrasCompletadas[`${filaIndex},${columnaIndex}`] || ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={letra}
            onChange={(e) => setLetra(e.target.value)}
            className="border p-2"
            placeholder="Introduce una letra"
          />
          <button onClick={enviarLetra} className="bg-blue-500 text-white p-2">
            Enviar Letra
          </button>

          {mostrarEstadisticas()}
        </div>
      )}
    </div>
  );
}

export default App;
