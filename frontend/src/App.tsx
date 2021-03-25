import React from 'react';
import jwt4auth from '@jwt4auth/general';
import { UserSession, UserSessionContext } from '@jwt4auth/reactjs';
import { Route, Switch } from 'react-router-dom';
import Conference from './views/Conference';
import logo from './assets/Logo.svg';
import './styles/App.css';
import UserDialog from './views/UserDialog';
import ConferenceDialog from './views/ConferenceDialog';
import IndexArticle from "./views/UserDialog/IndexArticle";

function App() {
  jwt4auth.setup({ uriPrefix: '/backend'});
  return (
    <div className="App">
      <div className="split-screen">
        <div className="split-screen__col section-black">
          <div className="split-screen-center">
            <IndexArticle/>
          </div>
        </div>
        <div className="split-screen__col section-white">
          <div className="split-screen-center">
            <UserSession>
              <Switch>
                <Route path="/conference/:session_id">
                  <Conference />
                </Route>
                <Route path="*">
                  <UserSessionContext.Consumer>
                    {(session) => (session.user ? <ConferenceDialog /> : <UserDialog />)}
                  </UserSessionContext.Consumer>
                </Route>
              </Switch>
            </UserSession>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
