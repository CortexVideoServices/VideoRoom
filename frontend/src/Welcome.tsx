import React, { useContext } from 'react';
import { UserSessionContext } from './UserSession';
import './styles/App.css';
import Login from './forms/Login';
import CreateConference from './forms/CreateConference';
import jwt4auth from './api/jwt4auth';

interface Props {
  tabIndex: number;
}

function Welcome(props: Props) {
  const userdata = useContext(UserSessionContext);
  const [tabIndex, setTabIndex] = React.useState(0);
  const selected = (index: number) => (index === tabIndex ? 'selected' : '');
  return (
    <div className="App-dialog">
      <div className="TabSet">
        {userdata === null ? (
          <div className={`Tab ${selected(0)}`} onClick={() => setTabIndex(0)}>
            I have
            <br />
            an account
          </div>
        ) : (
          <div className={`Tab ${selected(0)}`} onClick={() => setTabIndex(0)}>
            Create video
            <br />
            conference
          </div>
        )}
        {userdata === null ? (
          <div className={`Tab ${selected(1)}`} onClick={() => setTabIndex(1)}>
            I haven't
            <br />
            an account
          </div>
        ) : null}
        <div className={`Tab ${selected(2)}`} onClick={() => setTabIndex(2)}>
          I have link
          <br />
          to invitation
        </div>
        {userdata !== null ? (
          <div className="Tab" onClick={() => jwt4auth.logoff().finally(() => window.location.reload())}>
            Logoff
          </div>
        ) : null}
      </div>
      <div className={`TabPanel ${selected(0)}`}>{userdata === null ? <Login /> : <CreateConference />}</div>
      <div className={`TabPanel ${selected(1)}`}>Signup</div>
      <div className={`TabPanel ${selected(2)}`}></div>
    </div>
  );
}

export default Welcome;
