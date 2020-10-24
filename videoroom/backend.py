import hashlib
import logging
from uuid import uuid4
from datetime import datetime, timedelta
from aiohttp import web
from aiopg.sa import create_engine
from sqlalchemy import select, insert, update, delete
from cvs.web import middleware
from cvs.web import json_response, with_prefix
from videoroom.utils import ErrorWithInfo
from videoroom.models import User, RegToken

routes = web.RouteTableDef()

REG_TOKEN_EXPIRED = 15 * 60


class SignupError(ErrorWithInfo):
    """ Signup error"""


@routes.get('/state')
async def get_status(request: web.Request):
    app = request.app  # type: WebApplication
    return web.json_response(app.state)


@routes.post('/signup')
@routes.get('/signup/{token}')
@routes.post('/signup/{token}')
async def signup(request: web.Request):
    app = request.app  # type: WebApplication
    token = request.match_info.get('token')
    if request.content_type.startswith('application/json'):
        data = await request.json()
    else:
        data = await request.post()
    try:
        if not token:
            # Stage #1 of account registration
            email = data['email']
            if await app.signup_start(email):
                return web.HTTPOk()
        else:
            if request.method != 'POST':
                email = await app.signup_email(token)
                if email:
                    return json_response({'email': email})
            else:
                # stage #2 of signup
                password = data['password']
                display_name = data.get('display_name')
                if await app.signup_finish(token, display_name, password):
                    return web.HTTPCreated()
    except SignupError as exc:
        return web.json_response(exc.ext_info, status=400, reason=str(exc))
    return web.HTTPUnprocessableEntity()


class WebApplication(web.Application):
    """ Backend web application
    """

    def __init__(self, db, api_url, backend_prefix, proxy_pass, **kwargs):
        middlewares = kwargs.pop('middlewares', [])
        self.__state = dict(config=dict(api_url=api_url, backend_prefix=backend_prefix))
        if proxy_pass:
            self.__state['config']['proxy_pass'] = proxy_pass
            middlewares.append(middleware.ProxyPass(proxy_pass))
        super().__init__(middlewares=middlewares, **kwargs)
        self.add_routes(with_prefix(backend_prefix, routes))
        self.db = db
        self.__api_url = api_url
        self.__state['status'] = 'OK'

    @property
    def api_url(self):
        """ URL to server SDK API """
        return self.__api_url

    @property
    def state(self):
        """ Application state """
        return dict((k, v) for k, v in self.__state.items())

    async def signup_start(self, email):
        """ Stage #1 of account registration
        """
        async with self.db.acquire() as connection:
            if not await(await connection.execute(select([User]).where(User.email == email))).first():
                token = str(uuid4())
                expired_at = datetime.utcnow() + timedelta(seconds=REG_TOKEN_EXPIRED)
                query = insert(RegToken).values(token=token, email=email, expired_at=expired_at)
                if (await connection.execute(query)).rowcount:
                    # ToDo: send registration mail
                    return token
                raise SignupError('Error #101')
            raise SignupError('Error #100')

    async def signup_email(self, token):
        """ Gets email for given token
        """
        async with self.db.acquire() as connection:
            query = select([RegToken]).where(RegToken.token == token).where(RegToken.expired_at > datetime.utcnow())
            if reg_token := await(await connection.execute(query)).first():
                return reg_token.email
            raise SignupError('Error #200')

    async def signup_finish(self, token, display_name, password):
        """ Stage #2 of account registration
        """
        async with self.db.acquire() as connection:
            query = select([RegToken]).where(RegToken.token == token).where(RegToken.expired_at > datetime.utcnow())
            if reg_token := await(await connection.execute(query)).first():
                email = reg_token.email
                salt = hashlib.sha256(uuid4().bytes).hexdigest()
                password = self.salt_string(password, salt)
                query = insert(User).values(email=email, salt=salt, password=password, display_name=display_name)
                if (await connection.execute(query)).rowcount > 0:
                    return True
                raise SignupError('Error #201')
            raise SignupError('Error #200')

    @classmethod
    def salt_string(cls, salt, value):
        hash = hashlib.sha512(value.encode('utf16'))
        hash.update(salt.encode('utf16'))
        return hashlib.sha256(hash.digest()).hexdigest()

    @classmethod
    async def factory(cls, postgres_url, api_url, backend_prefix, proxy_pass=None, debug=False):
        logging.basicConfig(level=(logging.DEBUG if debug else logging.WARNING))
        db_engine = await create_engine(postgres_url)
        return cls(db_engine, api_url, backend_prefix, proxy_pass, logger=logging.root)


if __name__ == '__main__':
    import configargparse

    parser = configargparse.ArgumentParser("VideoRoom bakend")
    parser.add_argument('-c', '--config', is_config_file=True, help='config file path')
    parser.add_argument('-b', '--backend-prefix', default='/backend', help='URI prefix', env_var='BACKEND_PREFIX')
    parser.add_argument('-u', '--postgres-url', required=True, help='URL of Postgres', env_var='POSTGRES')
    parser.add_argument('-a', '--api-url', help='URI to server SDK API', env_var='SDK_API_URL')
    parser.add_argument('-p', '--port', default=7000, help='served on port', env_var='BACKEND_PORT')
    parser.add_argument('-d', '--debug', default=False, action='store_true', help='debug mode', env_var='DEBUG')
    parser.add_argument('--proxy-pass', help='ProxyPass URL', env_var='PROXY_PASS')
    options, _ = parser.parse_known_args()
    web.run_app(WebApplication.factory(options.postgres_url,
                                       options.api_url,
                                       options.backend_prefix,
                                       options.proxy_pass,
                                       options.debug), port=options.port)
