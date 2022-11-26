import React from 'react';
import logo from './alien.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Alien Invasion
        </p>
        <a
          className="App-link"
          href="websocket"
        >
          Start
        </a>
      </header>
    </div>
  );
}

export default App;
