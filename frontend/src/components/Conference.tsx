import React, { useContext, useEffect, useState } from 'react';
import logo from '../assets/Logo.svg';
import { Link, useParams } from 'react-router-dom';
import { ConferenceData } from '../api/backend';
import { UserSessionContext } from './UserSession';
import api from '../api';

function Conference() {
  const { session_id } = useParams();
  const user = useContext(UserSessionContext);
  const [conference, setConferenceData] = useState<ConferenceData | null | undefined>(undefined);
  useEffect(() => {
    updateConference().catch(console.error);
  });
  const updateConference = async () => {
    const result = await api.getConferenceData(session_id);
    if (result !== null && conference) {
      setConferenceData((state) => {
        Object.assign(state, result);
        return state;
      });
    } else setConferenceData(result);
  };
  const allowed = () => {
    if (conference) {
      if (!user.authenticated) {
        return conference.allow_anonymous;
      } else return true;
    }
    return false;
  };
  return allowed() ? (
    <div className="App-conference">
      <div className="App-conference-title">
        <h3>
          {conference && `${conference.display_name}`}{' '}
          {conference && conference.user && `created by ${conference.user.display_name}<${conference.user.email}>`}
        </h3>
      </div>
    </div>
  ) : (
    <>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="App-dialog">
        {typeof conference !== 'undefined' && (
          <>
            {conference ? (
              <p>
                This invitation is not allowed for anonymous users.
                <br />
                <Link to="/">Log in to this app</Link> right now!
              </p>
            ) : (
              <p>
                Invitation to conference is wrong or outdated. <br />
                <Link to="/">Create new conference</Link> right now!
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Conference;
