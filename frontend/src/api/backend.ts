import jwt4auth, { UserData } from '@jwt4auth/general';

const fetch = jwt4auth.fetch;

export interface ConferenceData {
  user?: Partial<UserData>;
  session_id: string;
  created_at: string;
  display_name: string;
  allow_anonymous: boolean;
  description: string;
  expired_at: string;
}

/**
 * Returns data for the last active user-created conference or for a conference with the given sessionId.
 * @param sessionId
 */
export async function getConferenceData(sessionId?: string): Promise<ConferenceData | null> {
  let uri = '/backend/conference';
  if (sessionId) uri = `${uri}/${sessionId}`;
  const resp = await fetch(uri);
  if (resp.ok) return await resp.json();
  return null;
}

interface CreateConferenceProps {
  display_name: string;
  allow_anonymous: boolean;
  description: string;
}

/**
 * Creates new conference and return its `sessionId`.
 * @param display_name
 * @param allow_anonymous
 * @param description
 */
export async function createConference({
  display_name,
  allow_anonymous,
  description,
}: CreateConferenceProps): Promise<ConferenceData | null> {
  const resp = await fetch('/backend/conference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      display_name,
      allow_anonymous,
      description,
    }),
  });
  if (resp.status === 201) {
    return await resp.json();
  }
  return null;
}

/**
 * Returns the email address of the user who started to sign up with this token
 * or `null` if token is bad or outdated.
 * @param token
 */
export async function getEmailBySignupToken(token: string): Promise<string | null> {
  const resp = await fetch(`/backend/signup/${token}`);
  if (resp.ok) {
    const data = await resp.json();
    return data.email || null;
  }
  return null;
}

/**
 * Request to start signup.
 * @param email
 */
export async function startSignup(email: string) {
  const resp = await fetch('/backend/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return resp.ok;
}

export interface SignupData {
  token: string;
  email: string;
  display_name: string;
  password: string;
}

/**
 * Request to finish signup
 * @param email
 * @param token
 * @param display_name
 * @param password
 */
export async function finishSignup({ email, token, display_name, password }: SignupData) {
  const resp = await fetch(`/backend/signup/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token, display_name, password }),
  });
  return resp.ok;
}


/**
 * Returns the email address of the user who started to renew password with this token
 * or `null` if token is bad or outdated.
 * @param token
 */
export async function getEmailByRenewToken(token: string): Promise<string | null> {
  const resp = await fetch(`/backend/renew/${token}`);
  if (resp.ok) {
    const data = await resp.json();
    return data.email || null;
  }
  return null;
}

/**
 * Request to start renew password.
 * @param email
 */
export async function startRenew(email: string) {
  const resp = await fetch('/backend/renew', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return resp.ok;
}

export interface RenewData {
  token: string;
  email: string;
  password: string;
}

/**
 * Request to finish renew
 * @param email
 * @param token
 * @param password
 */
export async function finishRenew({ email, token, password }: RenewData) {
  const resp = await fetch(`/backend/renew/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token, password }),
  });
  return resp.ok;
}

