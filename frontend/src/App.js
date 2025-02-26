import React, { useState, useEffect } from 'react';
import './App.css';
import { io } from 'socket.io-client';
import axios from 'axios';

// Conectar al servidor de socket.io
const socket = io('http://localhost:5000');

function App() {
  const [screen, setScreen] = useState('initial');
  const [codigoSala, setCodigoSala] = useState('');
  const [codigoSalaInput, setCodigoSalaInput] = useState('');

  const crearSala = async () => {
    const response = await axios.post('http://localhost:5000/api/crearSala');
    setCodigoSala(response.data.codigoSala);
    setScreen('sala');
  };

  const unirseSala = () => {
    if (codigoSalaInput) {
      setCodigoSala(codigoSalaInput);
      socket.emit('unirseSala', codigoSalaInput);
      setScreen('sala');
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
          <button onClick={unirseSala}>Unirse a Sala</button>
        </div>
      )}
      {screen === 'sala' && (
        <div className="sala-screen">
          <h1>Sala: {codigoSala}</h1>
          <div className="container">
            {/* Aquí se generará el crucigrama */}
              </div>
          <div className="sidebar">
            {/* Contenido seleccionable: chat, estadísticas, palabras */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
