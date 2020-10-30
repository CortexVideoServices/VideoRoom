import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import backend from '../api/backend';

interface Values {
  token: string;
  email: string;
  display_name: string;
  password: string;
}

const validate = (values: Values) => {
  const errors: Partial<Values> = {};
  if (!values.password) errors.email = 'Required';
  else if (values.email.length < 6) errors.email = 'Password must contain at least 6 characters.';
  return errors;
};

interface FinishFormProps {
  token: string;
  email: string;
}

function FinishForm({ email, token }: FinishFormProps) {
  const [result, setResult] = React.useState(0);
  if (email && email !== '' && result === 0)
    return (
      <Formik
        initialValues={{ token, email, display_name: '', password: '' }}
        validate={validate}
        onSubmit={(values, actions) => {
          backend
            .finishSingUp(values.email, values.token, values.display_name, values.password)
            .then((result) => setResult(result ? 1 : 2))
            .catch(() => setResult(2))
            .finally(() => actions.setSubmitting(false));
        }}
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
    );
  else if (result === 1)
    return (
      <>
        <p>
          We has created an account for you. <Link to="/login">Please login</Link>
        </p>
      </>
    );
  else
    return (
      <p>
        Invitation to sign up is wrong or outdated. <Link to="/">Try to sign up again</Link>.
      </p>
    );
}

export function UsersSignUpFinish() {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  useEffect(() => {
    fetch(`/backend/signup/${token}`)
      .then((resp) => resp.json())
      .then(({ email }) => setEmail(email));
  });
  return <FinishForm token={token} email={email} />;
}
