import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserSessionContext } from './UsersSession';
import '../../src/styles/AppOld.css';
import jwt4auth from '../../src/api/jwt4auth';
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
        {userdata !== null ? (
          <div className="Tab" onClick={() => jwt4auth.logoff().finally(() => window.location.reload())}>
            Logoff
          </div>
        ) : null}
      </div>
      <div className={`TabPanel ${selected(0)}`}>
        {userdata === null ? (
          <div>
            <Redirect to="/login" />
            <UsersLogin />
          </div>
        ) : (
          <ConferenceDlg />
        )}
      </div>
      <div className={`TabPanel ${selected(1)}`}>
        {tabIndex === 1 && <Redirect to="/signup" />}
        <UsersSignUp />
      </div>
    </div>
  );
}

export default Welcome;
