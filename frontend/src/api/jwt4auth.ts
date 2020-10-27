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

async function get_token_data() {
  if (typeof refresh_token === 'string' && token_data === null) {
    await refresh_token_data();
  }
  return token_data;
}

async function refresh_token_data() {
  return refresh();
}

export default {
  login,
  logoff,
  get_token_data,
  refresh_token_data,
  is_authenticated: () => typeof refresh_token === 'string',
};
