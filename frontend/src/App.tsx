import React from 'react';
import logo from './assets/Logo.svg';
import './styles/App.css';
import Welcome from './Welcome';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="App-dialog">
          <Welcome />
        </div>
      </header>
    </div>
  );
}

export default App;
