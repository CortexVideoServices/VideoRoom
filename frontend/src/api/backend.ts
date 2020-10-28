import jwt4auth from './jwt4auth';

async function startSingUp(email: string) {
  const resp = await fetch('/backend/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return resp.ok;
}

async function finishSingUp(email: string, token: string, display_name: string, password: string) {
  const resp = await fetch(`/backend/signup/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token, display_name, password }),
  });
  return resp.ok
}

export default {
  startSingUp,
  finishSingUp,
};
