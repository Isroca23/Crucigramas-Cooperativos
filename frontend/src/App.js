import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [screen, setScreen] = useState('initial');
  const [codigoSala, setCodigoSala] = useState('');
  const [codigoSalaInput, setCodigoSalaInput] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    // Escuchar eventos del servidor
    socket.on('jugadoresActualizados', (jugadoresActualizados) => {
      setJugadores(jugadoresActualizados);
    });

    socket.on('connect_error', () => {
      setError('Error de conexión con el servidor.');
    });

    return () => {
      // Limpiar eventos al desmontar el componente
      socket.off('jugadoresActualizados');
      socket.off('connect_error');
    };
  }, []);

  const crearSala = () => {
    if (!nombre) {
      setError('Por favor, introduce tu nombre.');
      console.error('Error: Por favor, introduce tu nombre.');
      return;
    }

    socket.emit('crearSala', { nombre, codigoSalaInput }, (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        setCodigoSala(response.codigoSala);
        setJugadores([response.jugador]);
      setScreen('sala');
    }
    });
  };

  const unirseSala = () => {
    if (!codigoSalaInput) {
      setError('Por favor, introduce un código de sala.');
      console.error('Error: Por favor, introduce un código de sala.');
      return;
    }
    if (!nombre) {
      setError('Por favor, introduce tu nombre.');
      console.error('Error: Por favor, introduce tu nombre.');
      return;
    }

    socket.emit('unirseSala', { codigoSala: codigoSalaInput, nombre }, (response) => {
      if (response.error) {
        setError(response.error);
      } else {
        setCodigoSala(codigoSalaInput);
        setScreen('sala');
    }
    });
  };

  const salirSala = () => {
    socket.emit('salirSala', { codigoSala, nombre });
      setScreen('initial');
      setCodigoSala('');
      setCodigoSalaInput('');
      setNombre('');
      setError('');
      setJugadores([]);
  };

  return (
    <div className="App">
      {screen === 'initial' && (
        <div className="initial-screen">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu Nombre"
          />
          <button onClick={crearSala}>Crear Sala</button>
          <input
            type="text"
            value={codigoSalaInput}
            onChange={(e) => setCodigoSalaInput(e.target.value)}
            placeholder="Código de Sala"
          />
          <button onClick={unirseSala}>Unirse a Sala</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
      {screen === 'sala' && (
        <div className="sala-screen">
          <h1>Sala: {codigoSala}</h1>
            <h2>Jugadores Conectados:</h2>
            <ul>
              {jugadores.map((jugador) => (
                <li key={jugador.id}>{jugador.nombre}</li>
              ))}
            </ul>
          <button onClick={salirSala}>Salir de la Sala</button>
        </div>
      )}
    </div>
  );
}

export default App;