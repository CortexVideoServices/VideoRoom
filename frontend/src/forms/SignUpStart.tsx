import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';

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

function SignUpStart() {
  const initialValues: Values = { email: '' };
  const [result, setResult] = React.useState(0);
  if (result === 0)
    return (
      <>
        <p>
          We will create a registration invitation for you and send it to your email. The invitation is limited in time,
          so as soon as possible, follow the link received in the letter to complete the account registration.
        </p>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={(values, actions) => {
            fetch('/backend/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(values),
            })
              .then((resp) => setResult(resp.ok ? 1 : 2))
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
          Try to login a little later
        </Link>
        .
      </p>
    );
}

export default SignUpStart;
