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
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [tab, setTab] = useState('chat');

  useEffect(() => {
    socket.on('error', (message) => {
      setError(message);
      console.error('Error:', message);
    });
    socket.on('jugadores', (jugadores) => {
      setJugadores(jugadores);
      setScreen('sala');
    });
    socket.on('mensaje', (data) => {
      setMensajes((prevMensajes) => [...prevMensajes, data]);
    });
    socket.on('codigoSala', (codigoSala) => {
      setCodigoSala(codigoSala);
    });
    return () => {
      socket.off('error');
      socket.off('jugadores');
      socket.off('mensaje');
      socket.off('codigoSala');
    };
  }, []);

  const crearSala = async () => {
    if (!nombre) {
      setError('Por favor, introduce tu nombre.');
      console.error('Error: Por favor, introduce tu nombre.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/crearSala', {
        nombre,
        codigoSalaInput: codigoSalaInput || undefined
      });
      setCodigoSala(response.data.codigoSala);
      setJugadores([response.data.jugador]);
      setScreen('sala');
    } catch (error) {
      setError(error.response.data.error);
      console.error('Error:', error.response.data.error);
    }
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
    socket.emit('unirseSala', { codigoSala: codigoSalaInput, nombre });
  };

  const enviarMensaje = () => {
    if (mensaje.trim()) {
      socket.emit('mensaje', { mensaje, codigoSala });
      setMensaje('');
    }
  };

  const salirSala = () => {
    if (window.confirm('¿Estás seguro de que quieres salir de la sala?')) {
      setScreen('initial');
      setCodigoSala('');
      setCodigoSalaInput('');
      setNombre('');
      setError('');
      setJugadores([]);
      setMensajes([]);
      setMensaje('');
      socket.emit('salirSala', { codigoSala, nombre });
    }
  };

  return (
    <div className="App">
      {screen === 'initial' && (
        <div className="initial-screen">
          <button onClick={crearSala}>Crear Sala</button>
          <input
            type="text"
            value={codigoSalaInput}
            onChange={(e) => setCodigoSalaInput(e.target.value)}
            placeholder="Código de Sala"
          />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu Nombre"
          />
          <button onClick={unirseSala}>Unirse a Sala</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
      {screen === 'sala' && (
        <div className="sala-screen">
          <h1>Sala: {codigoSala}</h1>
          <div className="container">
            <h2>Jugadores Conectados:</h2>
            <ul>
              {jugadores.map((jugador) => (
                <li key={jugador.id}>{jugador.nombre}</li>
              ))}
            </ul>
            {/* Aquí se generará el crucigrama */}
          </div>
          <div className="info-container" style={{ backgroundColor: 'cream', float: 'right' }}>
            <div className="tabs">
              <button onClick={() => setTab('estadisticas')}>Estadísticas</button>
              <button onClick={() => setTab('definiciones')}>Definiciones</button>
              <button onClick={() => setTab('chat')}>Chat</button>
            </div>
            <div className="tab-content">
              {tab === 'chat' && (
                <div className="chat">
                  <ul>
                    {mensajes.map((msg, index) => (
                      <li key={index}>{msg.mensaje}</li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escribe un mensaje"
                  />
                  <button onClick={enviarMensaje}>Enviar</button>
                </div>
              )}
              {/* Aquí irán las estadísticas y definiciones */}
            </div>
          </div>
          <button onClick={salirSala}>Salir de la Sala</button>
        </div>
      )}
    </div>
  );
}

export default App;