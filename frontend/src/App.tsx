import React from 'react';
import { Switch, Route } from 'react-router-dom';
import logo from './assets/Logo.svg';
import './styles/App.css';
import Welcome from './Welcome';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="App-dialog">
          <Switch>
            <Route path={['/signup', '/signup/:token']} children={<Welcome tabIndex={1} />} />
            <Route path="*" children={<Welcome tabIndex={0} />} />
          </Switch>
        </div>
      </header>
    </div>
  );
}

export default App;
