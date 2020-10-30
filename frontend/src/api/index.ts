import * as jwt4auth from './jwt4auth';
import * as backend from './backend';

export default {
  login: jwt4auth.login,
  logoff: jwt4auth.logoff,
  getUserData: jwt4auth.getTokenData,
  getConferenceData: backend.getConferenceData,
  createConference: backend.createConference,
};
