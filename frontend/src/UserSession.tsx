import React, { PropsWithChildren, useEffect, useState } from 'react';
import auth, { TokenData } from './api/jwt4auth';

// interface UserSessionData {
//   email: string;
//   display_name: string;
// }

/// Session context
export const UserSessionContext = React.createContext<TokenData | null>(null);

interface Props {}

function UserSession({ children }: PropsWithChildren<Props>) {
  const [value, setValue] = useState<TokenData | null>(null);
  useEffect(() => {
    auth.get_token_data().then((token_data) => setValue(token_data));
  });
  return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>;
}

export default UserSession;
