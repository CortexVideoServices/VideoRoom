import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';

interface Values {
  token: string;
  email: string;
  display_name: string;
  password: string;
}

const validate = (values: Partial<Values>) => {
  const errors: Partial<Values> = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  return errors;
};

function Start() {
  const [result, setResult] = useState<boolean | undefined>(undefined);
  const onSubmit = (values: Partial<Values>, actions: FormikHelpers<Partial<Values>>) => {
    if (values.email)
      api
        .startSingUp(values.email)
        .then((result) => setResult(result))
        .catch(() => setResult(false));
  };
  return (
    <>
      <p>
        We will create a registration invitation for you and send it to your email. The invitation is limited in time,
        so as soon as possible, follow the link received in the letter to complete the account registration.
      </p>
      {typeof result === 'undefined' ? (
        <Formik initialValues={{ email: '' }} validate={validate} onSubmit={onSubmit}>
          <Form>
            <label htmlFor="email">Yor email address</label>
            <Field id="email" name="email" placeholder="EMail" />
            <ErrorMessage name="email" component="div" className="App-dialog-field-error" />
            <button type="submit">Send an invitation</button>
          </Form>
        </Formik>
      ) : result ? (
        <p>
          We have <b>sent an invitation to sign up</b>, check your email.
        </p>
      ) : (
        <p>
          Start of sign up fail. Something is wrong. <br />
          Try to <Link to="/signup">sign up</Link> again a little later.
        </p>
      )}
    </>
  );
}

interface ContinueProps {
  token: string;
  email: string;
}

function Finish({ token, email }: ContinueProps) {
  const [result, setResult] = useState<boolean | undefined>(undefined);
  const onSubmit = (values: Values, actions: FormikHelpers<Values>) => {
    api
      .finishSingUp(values)
      .then((result) => setResult(result))
      .catch(() => setResult(false));
  };
  return (
    <>
      {typeof result === 'undefined' ? (
        <Formik
          initialValues={{ token, email, display_name: '', password: '' }}
          validate={validate}
          onSubmit={onSubmit}
        >
          <Form>
            <label htmlFor="email">Yor email address</label>
            <Field id="email" name="email" value={email} readOnly={true} />
            <ErrorMessage name="email" component="div" className="App-dialog-field-error" />
            <label htmlFor="display_name">Yor name or nick</label>
            <Field id="display_name" name="display_name" placeholder="Name or nick" />
            <ErrorMessage name="display_name" component="div" className="App-dialog-field-error" />
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" placeholder="Password" type="password" />
            <ErrorMessage name="password" component="div" className="App-dialog-field-error" />
            <button type="submit">Sign up</button>
          </Form>
        </Formik>
      ) : result ? (
        <p>
          We has created an account for you. <Link to="/login">Please login</Link>
        </p>
      ) : (
        <p>
          Invitation to sign up is wrong or outdated. <br />
          Try to <Link to="/signup">sign up</Link> again.
        </p>
      )}
    </>
  );
}

interface Props {
  className?: string;
}

function SignupForm({ className }: Props) {
  const { token } = useParams();
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (token) {
      api.getEmailBySignupToken(token).then((result) => setEmail(result));
    }
  });
  return (
    <div className={className}>
      {!token ? (
        <>
          {/* Start of registration */}
          <Start />
        </>
      ) : (
        <>
          {
            /* Continue of registration */
            !email ? (
              <p>
                Invitation to sign up is wrong or outdated. <br />
                Try to <Link to="/signup">sign up</Link> again.
              </p>
            ) : (
              <Finish token={token} email={email} />
            )
          }
        </>
      )}
    </div>
  );
}

export default SignupForm;
