import React from 'react';
import { Switch, Route } from 'react-router-dom';
import SignUpStart from './SignUpStart';
import SignUpFinish from './SignUpFinish';

function SignUp() {
  return (
    <Switch>
      <Route path="/signup/:token" children={<SignUpFinish />} />
      <Route path="/signup" children={<SignUpStart />} />
    </Switch>
  );
}

export default SignUp;
