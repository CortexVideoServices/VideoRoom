import React, { useContext, useEffect, useState } from 'react';
import logo from '../assets/Logo.svg';
import { Link, useParams, useHistory } from 'react-router-dom';
import { ConferenceData } from '../api';
import { UserSessionContext } from '@jwt4auth/reactjs';
import * as api from '../api';
import { Session, Publisher, Incoming, LocalStream, RemoteStream, Video } from '@cvss/react';
import switch_cam from '../assets/switch_cam.svg';
import mute_cam from '../assets/mute-cam.svg';
import muted_cam from '../assets/muted-cam.svg';
import mute_mic from '../assets/mute-mic.svg';
import muted_mic from '../assets/muted-mic.svg';
import mute_spk from '../assets/mute-spk.svg';
import muted_spk from '../assets/muted-spk.svg';
import exit_icon from '../assets/exit.svg';

function defaultUrl(): string {
  let { protocol, hostname, port } = window.location;
  protocol = protocol === 'http:' ? 'ws' : 'wss';
  return `${protocol}://${hostname}:${hostname === 'localhost' ? 5000 : port}/cvs/ws/v1`;
}

function Conference() {
  const history = useHistory();
  const { session_id: sessionId } = useParams();
  const session = useContext(UserSessionContext);
  const [conference, setConferenceData] = useState<ConferenceData | null | undefined>(undefined);
  useEffect(() => {
    api
      .getConferenceData(sessionId)
      .then((result) => {
        if (result !== null && conference) {
          setConferenceData((state) => {
            Object.assign(state, result);
            return state;
          });
        } else setConferenceData(result);
      })
      .catch(console.error);
  });
  const allowed = () => {
    if (conference) {
      if (!session.user) {
        return conference.allow_anonymous;
      } else return true;
    }
    return false;
  };
  let participantName = 'Anonymous';
  if (session.user) {
    participantName = `${session.user.display_name}<${session.user.email}>`;
  }

  return allowed() ? (
    <div className="App-conference">
      <div className="App-conference-title">
        <div className="text">
          <h3>
            {conference && `${conference.display_name}`}{' '}
            {conference && conference.user && `created by ${conference.user.display_name}<${conference.user.email}>`}
          </h3>
        </div>
        <div className="icon" onClick={() => history.push('/')}>
          <img src={exit_icon} className="icon" alt="exit from conference" />
        </div>
      </div>
      <div className="App-conference-panel">
        <Session sessionId={sessionId} serverUrl={defaultUrl()}>
          <Publisher width={320} className="streamView" participantName={participantName}>
            <LocalStream>
              {({ stream, participantName, switchCamera, enableAudio, enableVideo }) => {
                let audio = stream ? stream.getAudioTracks().length > 0 : false;
                let video = stream ? stream.getVideoTracks().length > 0 : false;
                return (
                  <div className="streamBox">
                    <div className="streamControl">
                      <div>
                        <span>{participantName || 'Local stream'}</span>
                        <div>
                          <img
                            src={switch_cam}
                            className="streamIcon"
                            onClick={() => switchCamera()}
                            alt="Switch camera"
                          />
                          <img
                            src={video ? mute_cam : muted_cam}
                            onClick={() => enableVideo(!video)}
                            alt="Video muter"
                          />
                          <img
                            src={audio ? mute_mic : muted_mic}
                            onClick={() => enableAudio(!audio)}
                            alt="Audio muter"
                          />
                        </div>
                      </div>
                    </div>
                    <Video stream={stream} className="streamView" />
                  </div>
                );
              }}
            </LocalStream>
          </Publisher>
          <Incoming clone={true}>
            <RemoteStream>
              {({ stream, participantName, muted, setMuted }) => (
                <div className="streamBox">
                  <div className="streamControl">
                    <div>
                      <span>{participantName || 'Remote stream'}</span>
                      <div>
                        <img src={muted ? muted_spk : mute_spk} onClick={() => setMuted(!muted)} alt="Audio muter" />
                      </div>
                    </div>
                  </div>
                  <Video stream={stream} className="streamView" muted={muted} />
                </div>
              )}
            </RemoteStream>
          </Incoming>
        </Session>
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
