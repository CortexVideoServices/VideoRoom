import json
import hashlib
import aiohttp
from typing import Dict, Optional
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, insert, update, delete
from aiohttp import web
import jwt4auth.aiohttp
from cvs.web.utils import JSONEncoder
from ..utils import Mailer, MIMEText
from ..models import User, RegToken, Conference

SIGNUP_TOKEN_EXPIRED = 15 * 60
REFRESH_TOKEN_EXPIRED = 30 * 60
CONFERENCE_EXPIRED = 15 * 60


class SignupError(Exception):
    """ Signup error"""


SIGN_UP_LETTER = """
<html><body>
<p>Hi!<p> 
<p>You can see this email because you started registering in the <b>VideoRoom</b> app. 
If you would like to continue, please follow <a href="https://cvs.solutions/#/signup/{0}">this link</a>.
</body></html>
"""


class TokenData(dict):
    """ Token data class """

    def __init__(self, user: User):
        super().__init__({'user_id': user.id, 'email': user.email, 'display_name': user.display_name})


class AuthManager(jwt4auth.aiohttp.AuthManager):
    """ Auth manager
    """

    async def check_credential(self, app: 'Application', username: str, password: str):
        return await app.check_credential(username, password)

    async def create_token_data(self, app: 'Application', username: str) -> Dict:
        if token_data := await app.create_token_data(username):
            return token_data
        raise ValueError()

    async def save_refresh_token(self, app: 'Application', token_data: Dict, refresh_token: str):
        if not await app.save_refresh_token(token_data, refresh_token):
            raise RuntimeError("Cannot save refresh token")

    async def check_refresh_token(self, app: 'Application', refresh_token: str) -> Dict:
        if token_data := await app.check_refresh_token(refresh_token):
            return token_data
        raise ValueError()

    async def reset_refresh_token(self, app: 'Application', token_data: Dict):
        if not await app.reset_refresh_token(token_data):
            raise RuntimeError("Cannot reset refresh token")

    @staticmethod
    def salt_value(salt, value):
        hash = hashlib.sha512(value.encode('utf16'))
        hash.update(salt.encode('utf16'))
        return hashlib.sha256(hash.digest()).hexdigest()


class Application(web.Application):
    """ Video room application
    """

    def __init__(self, settings: Dict, **kwargs):
        self.mailer = Mailer(kwargs.pop('mailer'))
        super().__init__(**kwargs)
        self.settings = settings
        self.status = 'OK'

    async def signup_start(self, email: str) -> Optional[str]:
        """ Stage #1 of account registration
        """
        db = self['db_engine']
        async with db.acquire() as connection:
            if not await(await connection.execute(select([User]).where(User.email == email))).first():
                token = str(uuid4())
                expired_at = datetime.now(timezone.utc) + timedelta(seconds=SIGNUP_TOKEN_EXPIRED)
                query = insert(RegToken).values(token=token, email=email, expired_at=expired_at)
                if (await connection.execute(query)).rowcount:
                    message = MIMEText(SIGN_UP_LETTER.format(token), "html", "utf-8")
                    await self.mailer.send(self.mailer.kwargs['username'], email, "Invitation to sign up", message)
                    # ToDo: send registration mail
                    return token
                raise SignupError('Error #101')
            raise SignupError('Error #100')

    async def signup_email(self, token: str) -> Optional[str]:
        """ Gets email for given token
        """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([RegToken]).where(RegToken.token == token).where(RegToken.expired_at > datetime.now(timezone.utc))
            if reg_token := await(await connection.execute(query)).first():
                return reg_token.email
            raise SignupError('Error #200')

    async def signup_finish(self, token: str, display_name: str, password: str) -> Optional[bool]:
        """ Stage #2 of account registration
        """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([RegToken]).where(RegToken.token == token).where(RegToken.expired_at > datetime.now(timezone.utc))
            if reg_token := await(await connection.execute(query)).first():
                email = reg_token.email
                salt = hashlib.sha256(uuid4().bytes).hexdigest()
                password = AuthManager.salt_value(password, salt)
                query = insert(User).values(email=email, salt=salt, password=password, display_name=display_name)
                if (await connection.execute(query)).rowcount > 0:
                    return True
                raise SignupError('Error #201')
            raise SignupError('Error #200')

    async def check_credential(self, username: str, password: str) -> Optional[bool]:
        """ Checks user credential
        """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([User]).where(User.email == username)
            if user := await(await connection.execute(query)).first():
                if AuthManager.salt_value(password, user.salt) == user.password:
                    return True

    async def create_token_data(self, username: str) -> Optional[Dict]:
        """ Creates token data
        """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([User]).where(User.email == username)
            if user := await(await connection.execute(query)).first():
                return TokenData(user)

    async def save_refresh_token(self, token_data: Dict, refresh_token: str) -> bool:
        """ Saves refresh token """
        db = self['db_engine']
        async with db.acquire() as connection:
            token_expired_at = datetime.now(timezone.utc) + timedelta(seconds=REFRESH_TOKEN_EXPIRED)
            query = update(User).where(User.email == token_data['email']) \
                .values(refresh_token=refresh_token, token_expired_at=token_expired_at)
            if (await connection.execute(query)).rowcount > 0:
                return True

    async def check_refresh_token(self, refresh_token) -> Optional[Dict]:
        """ Checks refresh token """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([User]).where(User.refresh_token == refresh_token).where(
                User.token_expired_at > datetime.now(timezone.utc))
            if user := await(await connection.execute(query)).first():
                return TokenData(user)

    async def reset_refresh_token(self, token_data):
        """ Reset refresh token """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = update(User).where(User.email == token_data['email']).values(refresh_token=None)
            if (await connection.execute(query)).rowcount > 0:
                return True

    async def get_conference(self, user_id):
        """ Return current conference if exists """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([Conference]).where(Conference.user_id == user_id).where(
                Conference.expired_at > datetime.now(timezone.utc))
            if conference := await(await connection.execute(query)).first():
                return conference

    async def get_conference_by_id(self, session_id):
        """ Return conference data by session id """
        db = self['db_engine']
        async with db.acquire() as connection:
            query = select([Conference]).where(Conference.session_id == session_id).where(
                Conference.expired_at > datetime.now(timezone.utc))
            if conference := await(await connection.execute(query)).first():
                result = dict(conference)
                query = select([User.email, User.display_name]).where(User.id == conference.user_id)
                if user := await(await connection.execute(query)).first():
                    result['user'] = user
                return result

    async def create_conference(self, user_id, display_name, description, allow_anonymous):
        db = self['db_engine']
        if await self.get_conference(user_id):
            return
        session_id = None
        started_at = datetime.now(timezone.utc)
        expired_at = started_at + timedelta(seconds=CONFERENCE_EXPIRED)

        async with aiohttp.ClientSession(json_serialize=lambda obj: json.dumps(obj, cls=JSONEncoder)) as session:
            try:
                data = dict(app_id=self.settings['api_key'], started_at=started_at, expired_at=expired_at,
                            display_name=display_name, allow_anonymous=allow_anonymous)
                resp = await session.request('POST', self.settings['api_url'] + '/v1/session', json=data)
                if resp.status == 201:
                    session_id = (await resp.json())['id']
                else:
                    raise ValueError(f"Wrong response status: ${resp.status}")
            except Exception as exc:
                message = f"SDK server unavailable: ${exc}"
                self.logger.exception(message)
                return
        async with db.acquire() as connection:
            query = insert(Conference).values(session_id=session_id, user_id=user_id,
                                              display_name=display_name, started_at=started_at, expired_at=expired_at,
                                              description=description, allow_anonymous=allow_anonymous)
            if (await connection.execute(query)).rowcount:
                return await self.get_conference_by_id(session_id)
