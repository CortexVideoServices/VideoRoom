export interface ConferenceData {
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
