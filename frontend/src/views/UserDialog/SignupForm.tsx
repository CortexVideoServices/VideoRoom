import React, { useEffect, useState } from 'react';
import TabSet from './TabSet';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { Link, useParams } from 'react-router-dom';
import * as api from '../../api';
import { SignupData } from '../../api';

const reEmail = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
const rePassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

interface SignupData2 extends SignupData {
  confirm: string;
}

const validate = (values: Partial<SignupData2>) => {
  const errors: Partial<SignupData2> = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!reEmail.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (values.token) {
    if (!values.password) errors.email = 'Required';
    else {
      if (!rePassword.test(values.password))
        errors.password =
          'The password must consist of a combination of eight or more numbers, capital and small Latin letters';
      else if (values.confirm && values.confirm !== values.password)
        errors.confirm = 'Password confirmation does not match';
    }
  }
  return errors;
};

function Start() {
  const [result, setResult] = useState<boolean | undefined>(undefined);
  const onSubmit = (values: Partial<SignupData>, actions: FormikHelpers<Partial<SignupData>>) => {
    if (values.email)
      api
        .startSignup(values.email)
        .then((result) => setResult(result))
        .catch(() => setResult(false));
  };
  return (
    <>
      <h2>Register new account</h2>
      <p>
        We will create a registration invitation for you and send it to your email. The invitation is limited in time,
        so as soon as possible, follow the link received in the letter to complete the account registration.
      </p>
      {typeof result === 'undefined' ? (
        <Formik initialValues={{ email: '' }} validate={validate} onSubmit={onSubmit}>
          <Form className="App-dialog-panel">
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
          <span className="error-text">Start of sign up fail. Something is wrong.</span> <br />
          Try to{' '}
          <Link to="/signup" onClick={() => setResult(undefined)}>
            sign up
          </Link>{' '}
          again a little later.
        </p>
      )}
    </>
  );
}

interface FinishProps {
  token: string;
  email: string;
}

function Finish({ token, email }: FinishProps) {
  const [result, setResult] = useState<boolean | undefined>(undefined);
  const onSubmit = (values: SignupData2) => {
    api
      .finishSignup(values)
      .then((result) => setResult(result))
      .catch(() => setResult(false));
  };
  if (typeof result === 'undefined')
    return (
      <Formik
        initialValues={{ token, email, display_name: '', password: '', confirm: '' }}
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
          <label htmlFor="password">Confirm password</label>
          <Field id="confirm" name="confirm" placeholder="Confirm password" type="password" />
          <ErrorMessage name="confirm" component="div" className="App-dialog-field-error" />
          <button type="submit">Sign up</button>
        </Form>
      </Formik>
    );
  else if (result)
    return (
      <p>
        We have created an account for you. <Link to="/login">Please login</Link>
      </p>
    );
  else
    return (
      <p>
        <span className="error-text">Invitation to sign up is wrong or outdated.</span> <br />
        Try to{' '}
        <Link to="/signup" onClick={() => setResult(undefined)}>
          sign up
        </Link>{' '}
        again.
      </p>
    );
}

export default function () {
  const { token } = useParams();
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (token) {
      api.getEmailBySignupToken(token).then((result) => setEmail(result));
    }
  });
  return (
    <div className="App-dialog">
      <div className="App-dialog-panel">
        {!token ? (
          <Start />
        ) : !email ? (
          <p>
            <span className="error-text">Invitation to sign up is wrong or outdated.</span> <br />
            Try to <Link to="/signup">sign up</Link> again.
          </p>
        ) : (
          <Finish token={token} email={email} />
        )}
      </div>
      <TabSet tabindex={1} />
    </div>
  );
}
