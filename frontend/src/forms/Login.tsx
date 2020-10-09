import React from 'react';
import { Formik, Form, Field, useFormik, ErrorMessage } from 'formik';

interface Values {
  email: string;
  password: string;
}

const validate = (values: Values) => {
  const errors: Partial<Values> = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.password) {
    errors.password = 'Required';
  }
  return errors;
};

function Login() {
  const initialValues: Values = { email: '', password: '' };
  const [result, setResult] = React.useState(0);
  if (result === 0)
    return (
      <>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={(values, actions) => {
            fetch('/backend/login', {
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
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" placeholder="Password" type="password" />
            <ErrorMessage name="password" component="div" className="App-dialog-field-error" />
            <button type="submit">Login</button>
          </Form>
        </Formik>
      </>
    );
  else if (result === 1) return <p>SUCCESS!</p>;
  else return <p>Something is wrong. Try to register a little later.</p>;
}

export default Login;
