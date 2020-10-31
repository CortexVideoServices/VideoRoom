import React, { useContext, useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useHistory } from 'react-router-dom';
import { ConferenceData } from '../api/backend';
import { UserSessionContext } from './UserSession';
import api from '../api';

interface ShowProps {
  className?: string;
  conference: ConferenceData;
  updateConference: () => void;
}

function ShowConference({ className, conference, updateConference }: ShowProps) {
  const history = useHistory();
  const path = `/conference/${conference.session_id}`;
  const url = window.location.origin + '/#' + path;
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then((result) => alert('Invitation link has copied to clipboard'))
      .catch(console.error);
  };
  useEffect(() => {
    const timer = setInterval(() => updateConference(), 5 * 1000);
    return () => clearTimeout(timer);
  });
  return (
    <div className={className}>
      <div className="ConferenceInfo">
        <div className="Row">
          <div className="Label">Title:</div>
          <div className="Value">{conference.display_name}</div>
        </div>
        <div className="Row">
          <div className="Memo">{conference.description}</div>
        </div>
        <div className="Row">
          <div className="Label">Allow anonymous:</div>
          <div className="Value">{conference.allow_anonymous ? 'Yes' : 'No'}</div>
        </div>
        <div className="Row">
          <div className="Label">Expired at:</div>
          <div className="Value">{new Date(conference.expired_at).toLocaleTimeString()}</div>
        </div>
        <div className="Row">
          <button className="TableBottom" onClick={() => copyToClipboard()}>
            Copy invitation to clipboard
          </button>
          <button className="TableBottom" onClick={() => history.push(path)}>
            Start conference
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateProps {
  className?: string;
  setConferenceData: (conference: ConferenceData | null) => void;
}

function CreateConference({ className, setConferenceData }: CreateProps) {
  return (
    <div className={className}>
      <p>
        At the moment, only one current video conference can be created. Enter a description and determine if anonymous
        users can connect.
      </p>
      <p>Attention! The time during which you can start the created conference is limited.</p>
      <Formik
        initialValues={{ display_name: '', description: '', allow_anonymous: false }}
        validate={(values) => {
          const errors: Partial<ConferenceData> = {};
          if (!values.display_name) errors.display_name = 'Required';
          if (!values.description) errors.description = 'Required';
          return errors;
        }}
        onSubmit={(values, actions) => {
          api
            .createConference(values)
            .then((result) => setConferenceData(result))
            .catch(console.error);
        }}
      >
        <Form>
          <label htmlFor="display_name">Display name</label>
          <Field id="display_name" name="display_name" placeholder="Conference display name" />
          <label htmlFor="description">Conference description</label>
          <Field
            id="description"
            name="description"
            placeholder="Describe the conference you are creating"
            component="textarea"
          />
          <ErrorMessage name="description" component="div" className="App-dialog-field-error" />
          <label htmlFor="allow_anonymous">Allow anonymous</label>
          <Field id="allow_anonymous" name="allow_anonymous" type="checkbox" />
          <button type="submit">Create</button>
        </Form>
      </Formik>
    </div>
  );
}

interface Props {
  className?: string;
  sessionId?: string;
}

function ConferenceDlg({ className, sessionId }: Props) {
  const user = useContext(UserSessionContext);
  const [conference, setConferenceData] = useState<ConferenceData | null | undefined>(undefined);
  const updateConference = async () => {
    const result = await api.getConferenceData(sessionId);
    if (result !== null && conference) {
      setConferenceData((state) => {
        Object.assign(state, result);
        return state;
      });
    } else setConferenceData(result);
  };
  useEffect(() => {
    updateConference().catch(console.error);
  });
  if (typeof conference !== 'undefined') {
    if (conference !== null) {
      return (
        <ShowConference
          className={className}
          conference={conference}
          updateConference={() => updateConference().catch(console.error)}
        />
      );
    } else {
      if (user.authenticated) return <CreateConference className={className} setConferenceData={setConferenceData} />;
      else
        return (
          <div className={className}>
            <p className="error">The conference is out of date or not available to anonymous. Try to log.</p>
          </div>
        );
    }
  }
  return null;
}

export default ConferenceDlg;
