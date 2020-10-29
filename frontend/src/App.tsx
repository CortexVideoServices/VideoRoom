import React from 'react';
import { Switch, Route } from 'react-router-dom';
import logo from './assets/Logo.svg';
import './styles/App.css';
import UsersSession from './components/UsersSession';
import Welcome from './components/Welcome';
import Conference from './components/Conference';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <UsersSession>
        <Switch>
          <Route path="/conference/:session_id" children={<Conference />} />
          <Route path="*" children={<Welcome tabIndex={0} />} />
        </Switch>
      </UsersSession>
    </div>
  );
}

export default App;
