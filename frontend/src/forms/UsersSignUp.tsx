import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { UsersSignUpStart } from './UsersSignUpStart';
import { UsersSignUpFinish } from './UsersSignUpFinish';

function UsersSignUp() {
  return (
    <Switch>
      <Route path="/signup/:token" children={<UsersSignUpFinish />} />
      <Route path="*" children={<UsersSignUpStart />} />
    </Switch>
  );
}

export default UsersSignUp;
