import React from 'react';
import jwt4auth from '@jwt4auth/general';
import { UserSession, UserSessionContext } from '@jwt4auth/reactjs';
import { Route, Switch } from 'react-router-dom';
import Conference from './views/Conference';
import logo from './assets/Logo.svg';
import './styles/App.css';
import UserDialog from './views/UserDialog';
import ConferenceDialog from './views/ConferenceDialog';

function App() {
  jwt4auth.setup({ uriPrefix: '/backend'});
  return (
    <div className="App">
      <UserSession>
        <Switch>
          <Route path="/conference/:session_id">
            <Conference />
          </Route>
          <Route path="*">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
            </header>
            <UserSessionContext.Consumer>
              {(session) => (session.user ? <ConferenceDialog /> : <UserDialog />)}
            </UserSessionContext.Consumer>
          </Route>
        </Switch>
      </UserSession>
    </div>
  );
}

export default App;
