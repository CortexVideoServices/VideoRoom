import React from 'react';
import { useHistory } from 'react-router-dom';

interface Props {
  tabindex: number;
}

function TabSet({ tabindex }: Props) {
  const history = useHistory();
  return (
    <div className="App-dialog-tabset">
      <div className={`App-dialog-tab ${tabindex === 0 ? 'selected':''}`} onClick={() => history.push('/login')}>
          Already have an account? Sign In
      </div>
      <div className={`App-dialog-tab ${tabindex === 1 ? 'selected':''}`} onClick={() => history.push('/signup')}>
          Register new account
      </div>
    </div>
  );
}

export default TabSet;
