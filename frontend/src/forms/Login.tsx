import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import auth from '../api/jwt4auth';

interface Values {
  email: string;
  password: string;
}

const validate = (values: Values) => {
  const errors: Partial<Values> = {};
  if (!values.email) errors.email = 'Required';
  if (!values.password) errors.password = 'Required';
  return errors;
};

function Login() {
  const [result, setResult] = React.useState(0);
  if (result < 2) {
    if (result === 1)
      window.location.reload();
    return (
      <Formik
        initialValues={{ email: '', password: '' }}
        validate={validate}
        onSubmit={(values, actions) => {
          auth
            .login(values.email, values.password)
            .then((value) => setResult(value ? 1 : 2))
            .catch(() => setResult(3))
            .finally(() => actions.setSubmitting(false));
        }}
      >
        <Form>
          <label htmlFor="email">Yor email address</label>
          <Field id="email" name="email" placeholder="EMail" />
          <ErrorMessage name="email" component="div" className="App-dialog-field-error" />
          <label htmlFor="password">Password</label>
          <Field id="password" name="password" placeholder="Password" type="password" />
          <ErrorMessage name="password" component="div" className="App-dialog-field-error" />
          <button type="submit">Login</button>
        </Form>
      </Formik>
    );
  } else if (result === 2)
    return (
      <p>
        Account with this email address and this password not found.{' '}
        <Link to="/" onClick={() => setResult(0)}>
          Please try again
        </Link>
      </p>
    );
  else
    return (
      <p>
        Something is wrong.{' '}
        <Link to="/" onClick={() => setResult(0)}>
          Try to login a little later.
        </Link>
      </p>
    );
}

export default Login;
