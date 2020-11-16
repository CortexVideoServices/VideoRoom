import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import RenewForm from './RenewForm';

function UserDialog() {
  const history = useHistory();
  useEffect(() => {
    return () => history.push('/');
  });
  return (
    <Switch>
      <Route exact={true} path={['/login', '/']} component={LoginForm} />
      <Route exact={true} path={['/signup', '/signup/:token']} component={SignupForm} />
      <Route exact={true} path={['/renew', '/renew/:token']} component={RenewForm} />
    </Switch>
  );
}

export default UserDialog;
