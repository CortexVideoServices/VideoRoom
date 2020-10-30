import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import api from './api';
import logo from './assets/Logo.svg';
import './styles/App.css';
import Conference from './components/Conference';
import { RoutedTab, RoutedTabs } from './components/RoutedTabs';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ConferenceDlg from './components/ConferenceDlg';
import UserSession from './components/UserSession';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <UserSession>
        {({ user, doLogin, doLogoff }) => (
          <Switch>
            <Route path="/conference/:session_id" children={<Conference />} />
            <Route path="*">
              <div className="App-dialog">
                {'authenticated' in user && !user.authenticated && (
                  <>
                    <RoutedTabs className="App-dialog-tabset">
                      <RoutedTab
                        path={['/login', '/']}
                        className="App-dialog-tab"
                        label={
                          <>
                            I have
                            <br />
                            an account
                          </>
                        }
                      >
                        <LoginForm className="App-dialog-panel" doLogin={doLogin} />
                      </RoutedTab>
                      <RoutedTab
                        path={['/signup', '/signup/:token']}
                        className="App-dialog-tab"
                        label={
                          <>
                            I haven't
                            <br />
                            an account
                          </>
                        }
                      >
                        <SignupForm className="App-dialog-panel" />
                      </RoutedTab>
                    </RoutedTabs>
                  </>
                )}
                {'authenticated' in user && user.authenticated && (
                  <>
                    <RoutedTabs className="App-dialog-tabset">
                      <RoutedTab
                        path="/"
                        className="App-dialog-tab"
                        label={
                          <>
                            Video
                            <br />
                            conference
                          </>
                        }
                      >
                        <ConferenceDlg className="App-dialog-panel" />
                      </RoutedTab>
                      <div className="App-dialog-tab" onClick={() => doLogoff()}>
                        Logoff
                      </div>
                    </RoutedTabs>
                  </>
                )}
              </div>
            </Route>
          </Switch>
        )}
      </UserSession>{' '}
    </div>
  );
}

export default App;
