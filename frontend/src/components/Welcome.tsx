import React, { useContext } from 'react';
import { UserSessionContext } from './UsersSession';
import '../styles/App.css';
import jwt4auth from '../api/jwt4auth';
import UsersLogin from './UsersLogin';
import ConferenceDlg from './ConferenceDlg';
import UsersSignUp from './UsersSignUp';

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
          <>
            <div className={`Tab ${selected(0)}`} onClick={() => setTabIndex(0)}>
              I have
              <br />
              an account
            </div>
            <div className={`Tab ${selected(1)}`} onClick={() => setTabIndex(1)}>
              I haven't
              <br />
              an account
            </div>
          </>
        ) : (
          <div className={`Tab ${selected(0)}`} onClick={() => setTabIndex(0)}>
            Video
            <br />
            conference
          </div>
        )}
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
      <div className={`TabPanel ${selected(0)}`}>{userdata === null ? <UsersLogin /> : <ConferenceDlg />}</div>
      <div className={`TabPanel ${selected(1)}`}>
        <UsersSignUp />
      </div>
      <div className={`TabPanel ${selected(2)}`}></div>
    </div>
  );
}

export default Welcome;
