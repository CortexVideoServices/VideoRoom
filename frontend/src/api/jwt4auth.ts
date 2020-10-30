const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

export interface TokenData {
  [index: string]: any;
}

let refresh_token: string | null = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
let token_data: TokenData | null = null;

/**
 * User login (receives access and refresh tokens)
 * @param username
 * @param password
 */
export async function login(username: string, password: string) {
  const resp = await fetch('/backend/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (resp.ok) {
    const data = await resp.json();
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
    refresh_token = data.refresh_token;
    token_data = data.token_data;
    console.log('$$token_data', token_data); // ToDo: remove this line
    return true;
  }
  return false;
}

/**
 * Refreshes access token
 */
export async function refresh() {
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
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
      refresh_token = data.refresh_token;
      token_data = data.token_data;
      console.log('$$token_data', token_data); // ToDo: remove this line
      return true;
    } else {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      refresh_token = null;
      token_data = null;
    }
  }
  return false;
}

/**
 * User logoff (Reset access and refresh tokens)
 */
export async function logoff() {
  if (typeof refresh_token === 'string') {
    await fetch('/backend/logoff');
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    refresh_token = null;
    token_data = null;
  }
}

/**
 * Returns token data
 */
export async function getTokenData() {
  if (
    typeof refresh_token === 'string' &&
    token_data !== null &&
    'exp' in token_data &&
    token_data.exp * 1000 > Date.now()
  ) {
    return token_data;
  }
  await refresh();
  return token_data;
}
