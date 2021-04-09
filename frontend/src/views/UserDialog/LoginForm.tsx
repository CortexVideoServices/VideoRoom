import React, { useContext } from 'react';
import { UserSessionContext } from '@jwt4auth/reactjs';
import TabSet from './TabSet';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Link } from 'react-router-dom';

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

function LoginForm() {
  const [error, setError] = React.useState('');
  const session = useContext(UserSessionContext);
  return (
    <div className="App-dialog">
      <h2>Sign in</h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validate={validate}
        onSubmit={async ({ email, password }) => {
          if (!(await session.login(email, password))) setError('Incorrect username or password');
        }}
      >
        <Form className="App-dialog-panel">

          <label htmlFor="email">Yor email address</label>
          <Field type="text" id="email" name="email" placeholder="EMail" />
          <ErrorMessage name="email" component="div" className="App-dialog-field-error" />

          <label htmlFor="password">Password</label>
          <Field id="password" name="password" placeholder="Password" type="password" />
          <ErrorMessage name="password" component="div" className="App-dialog-field-error" />
          <div className="LoginForm-end-line">
            <Link to="/renew">Forgot password?</Link>
            <button type="submit">Login</button>
          </div>
          <div className="App-dialog-field-error">{error}</div>
        </Form>
      </Formik>

      <TabSet tabindex={0} />
    </div>
  );
}

export default LoginForm;
