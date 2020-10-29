import jwt4auth from './jwt4auth';

export interface ConferenceValue {
  display_name: string;
  allow_anonymous: boolean;
  description: string;
}

export interface ConferenceData {
  session_id: string;
  created_at: string;
  display_name: string;
  allow_anonymous: boolean;
  description: string;
  expired_at: string;
}

async function createConference(data: ConferenceValue) {
  const resp = await fetch('/backend/conference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return resp.ok;
}

async function getConference(): Promise<ConferenceData | null> {
  const resp = await fetch('/backend/conference');
  if (resp.ok) {
    return await resp.json();
  }
  return null;
}

async function getConferenceById(session_id: string): Promise<ConferenceData | null> {
  const resp = await fetch(`/backend/conference/${session_id}`);
  if (resp.ok) {
    return await resp.json();
  }
  return null;
}

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
  return resp.ok;
}

export default {
  startSingUp,
  finishSingUp,
  getConference,
  createConference,
  getConferenceById,
};
