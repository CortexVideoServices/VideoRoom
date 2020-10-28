import React, { PropsWithChildren, useEffect, useState } from 'react';
import auth, { TokenData } from '../api/jwt4auth';

/// User session context
export const UserSessionContext = React.createContext<TokenData | null>(null);

interface Props {}

function UsersSession({ children }: PropsWithChildren<Props>) {
  const [value, setValue] = useState<TokenData | null>(null);
  useEffect(() => {
    auth.getTokenData().then((token_data) => setValue(token_data));
  });
  return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>;
}

export default UsersSession;
