import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { DoLoginFunc } from './UserSession';

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

interface Props {
  className?: string;
  doLogin: DoLoginFunc;
}

function LoginForm({ className, doLogin }: Props) {
  const [error, setError] = React.useState('');
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={validate}
      onSubmit={(values, actions) => {
        doLogin(values.email, values.password).then((result) => result.error && setError(result.error));
      }}
    >
      <Form className={className}>
        <label htmlFor="email">Yor email address</label>
        <Field id="email" name="email" placeholder="EMail" />
        <ErrorMessage name="email" component="div" className="App-dialog-field-error" />
        <label htmlFor="password">Password</label>
        <Field id="password" name="password" placeholder="Password" type="password" />
        <ErrorMessage name="password" component="div" className="App-dialog-field-error" />
        <button type="submit">Login</button>
        <div className="App-dialog-field-error">{error}</div>
      </Form>
    </Formik>
  );
}

export default LoginForm;
