import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import backend from '../api/backend';

interface Values {
  email: string;
}

const validate = (values: Values) => {
  const errors: Partial<Values> = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  return errors;
};

export function UsersSignUpStart() {
  const [result, setResult] = React.useState(0);
  if (result === 0)
    return (
      <>
        <p>
          We will create a registration invitation for you and send it to your email. The invitation is limited in time,
          so as soon as possible, follow the link received in the letter to complete the account registration.
        </p>
        <Formik
          initialValues={{ email: '' }}
          validate={validate}
          onSubmit={(values, actions) => {
            backend
              .startSingUp(values.email)
              .then((result) => setResult(result ? 1 : 2))
              .catch(() => setResult(2))
              .finally(() => actions.setSubmitting(false));
          }}
        >
          <Form>
            <label htmlFor="email">Yor email address</label>
            <Field id="email" name="email" placeholder="EMail" />
            <ErrorMessage name="email" component="div" className="App-dialog-field-error" />
            <button type="submit">Send an invitation</button>
          </Form>
        </Formik>
      </>
    );
  else if (result === 1) return <p>We have sent an invitation to sign up, check your email.</p>;
  else
    return (
      <p>
        Something is wrong.{' '}
        <Link to="/" onClick={() => setResult(0)}>
          Try to sign up a little later.
        </Link>
      </p>
    );
}
