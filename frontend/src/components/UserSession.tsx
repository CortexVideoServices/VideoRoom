import React, { ReactNode, useEffect, useState } from 'react';
import api from '../api';
import { useHistory } from 'react-router-dom';

/// User session data
export interface UserSessionData {
  email?: string;
  display_name?: string;
  authenticated?: boolean;
}

/// User session context
export const UserSessionContext = React.createContext<UserSessionData>({});

/// Type of result of login function
export interface LoginResult {
  success?: true;
  error?: string;
}

/// Login function type
export type DoLoginFunc = (username: string, password: string) => Promise<LoginResult>;

interface ChildrenProps {
  user: UserSessionData;
  doLogin: DoLoginFunc;
  doLogoff: () => void;
}

interface Props {
  children: (props: ChildrenProps) => ReactNode;
}

const anonymous: UserSessionData = { display_name: 'Anonymous', authenticated: false };

/// User session component
function UserSession({ children }: Props) {
  const history = useHistory();
  const [user, setUserSessionData] = useState<UserSessionData>({});
  const applyUserData = async () => {
    const token_data = await api.getUserData();
    if (token_data !== null)
      setUserSessionData((state) => {
        const newState = {
          authenticated: true,
          display_name: token_data.display_name,
          email: token_data.email,
        };
        if (state.authenticated) {
          Object.assign(state, newState);
          return state;
        } else return newState;
      });
    else setUserSessionData(anonymous);
  };
  const onLogOff = async () => {
    setUserSessionData(anonymous);
    if (history.location.pathname !== '/') history.push('/');
  };
  const doLogin = async (username: string, password: string) => {
    const result: LoginResult = {};
    try {
      if (
        await api.login(username, password, () => {
          onLogOff();
        })
      ) {
        await applyUserData();
        if (history.location.pathname !== '/') history.push('/');
        result.success = true;
      } else result.error = 'Account with this credentials has not found.';
    } catch (e) {
      result.error = 'Something is wrong. Try to login a little later.';
    }
    return result;
  };
  const doLogoff = () => {
    api.logoff().finally(() => onLogOff());
  };
  useEffect(() => {
    applyUserData();
  });
  console.log('$user', user); //ToDo:
  return (
    <UserSessionContext.Provider value={user}>{children({ user, doLogin, doLogoff })}</UserSessionContext.Provider>
  );
}

export default UserSession;
