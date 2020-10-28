export interface TokenData {
  [index: string]: any;
}

let refresh_token: string | null = localStorage.getItem('jwt4auth.refresh_token');
let token_data: TokenData | null = null;

async function login(username: string, password: string) {
  const resp = await fetch('/backend/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (resp.ok) {
    const data = await resp.json();
    localStorage.setItem('jwt4auth.refresh_token', data.refresh_token);
    refresh_token = data.refresh_token;
    token_data = data.token_data;
    return true;
  }
  return false;
}

async function refresh() {
  if (typeof refresh_token === 'string') {
    const resp = await fetch('/backend/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });
    if (resp.ok) {
      const data = await resp.json();
      localStorage.setItem('jwt4auth.refresh_token', data.refresh_token);
      refresh_token = data.refresh_token;
      token_data = data.token_data;
      return true;
    } else {
      localStorage.removeItem('jwt4auth.refresh_token');
      refresh_token = null;
      token_data = null;
    }
  }
  return false;
}

async function logoff() {
  if (typeof refresh_token === 'string') {
    await fetch('/backend/logoff');
    localStorage.removeItem('jwt4auth.refresh_token');
    refresh_token = null;
    token_data = null;
  }
}

async function getTokenData() {
  if (typeof refresh_token === 'string' && token_data === null) {
    await refreshTokenData();
  }
  return token_data;
}

async function refreshTokenData() {
  return refresh();
}

export default {
  fetch,
  login,
  logoff,
  getTokenData: getTokenData,
  refreshTokenData: refreshTokenData,
  isAuthenticated: () => typeof refresh_token === 'string',
};
