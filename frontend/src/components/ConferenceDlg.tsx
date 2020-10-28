import React, { useEffect, useRef, useState } from 'react';
import backend, { ConferenceData, ConferenceValue } from '../api/backend';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Link } from 'react-router-dom';

const validate = (values: ConferenceValue) => {
  const errors: Partial<ConferenceValue> = {};
  if (!values.display_name) errors.display_name = 'Required';
  if (!values.description) errors.description = 'Required';
  return errors;
};

function CreateConference() {
  const [result, setResult] = React.useState(0);
  if (result === 0)
    return (
      <>
        <p>
          At the moment, only one current video conference can be created. Enter a description and determine if
          anonymous users can connect. The invitation link will be active for 15 minutes.
        </p>
        <Formik
          initialValues={{ display_name: '', description: '', allow_anonymous: false }}
          validate={validate}
          onSubmit={(values, actions) => {
            backend
              .createConference(values)
              .then((result) => setResult(result ? 1 : 2))
              .catch(() => setResult(2))
              .finally(() => actions.setSubmitting(false));
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
      </>
    );
  else if (result === 1)
    return (
      <p>
        The conference was set up successfully. <Link to="/">Follow this link</Link>.
      </p>
    );
  else
    return (
      <p>
        Something is wrong.{' '}
        <Link to="/" onClick={() => setResult(0)}>
          Try to create new conference a little later.
        </Link>
      </p>
    );
}

function ShowConference(data: ConferenceData) {
  return <div></div>;
}

function ConferenceDlg() {
  const conference = useRef<ConferenceData | null>(null);

  useEffect(() => {
    backend
      .getConference()
      .then((data) => {
        conference.current = data;
      })
      .catch(() => {
        conference.current = null;
      });
  });
  if (conference.current === null) return <CreateConference />;
  else return <ShowConference {...conference.current} />;
}

export default ConferenceDlg;
