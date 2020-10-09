import json
import hashlib
import argparse
import logging
from uuid import uuid4
from datetime import datetime, timedelta
from aiohttp import web
from aiopg.sa import create_engine
from sqlalchemy import select, insert, update, delete
from cvs.tools import proxy_pass_middleware, JSONEncoder
from videoroom.utils import ErrorWithInfo
from videoroom.models import User, RegToken

routes = web.RouteTableDef()
json_dumps = lambda obj: json.dumps(obj, cls=JSONEncoder)
json_response = lambda obj, *args, **kwargs: web.json_response(obj, *args, dumps=json_dumps, **kwargs)

REG_TOKEN_EXPIRED = 15 * 60


class SignupError(ErrorWithInfo):
    """ Signup error"""


@routes.get('/state')
async def get_status(request: web.Request):
    return json_response({
        'status': 'OK'
    })


@routes.post('/signup')
@routes.post('/signup/{token}')
async def signup(request: web.Request):
    app = request.app  # type: WebApplication
    token = request.match_info.get('token')
    data = await request.post()
    try:
        if not token:
            # Stage #1 of account registration
            email = data['email']
            token = await app.signup_start(email)
            return json_response({'token': token}, status=201)
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

    def __init__(self, db, **kwargs):
        middlewares = kwargs.pop('middlewares', [])
        proxy_pass = kwargs.pop('proxy_pass', None)
        if proxy_pass:
            middlewares.append(lambda request, handler: proxy_pass_middleware(request, handler, proxy_pass))
        super().__init__(middlewares=middlewares, **kwargs)
        self.add_routes(routes)
        self.db = db

    async def signup_start(self, email):
        """ Stage #1 of account registration
        """
        async with self.db.acquire() as connection:
            if await(await connection.execute(select([User]).where(User.email == email))).first():
                raise SignupError('Email already registered')
            token = str(uuid4())
            expired_at = datetime.utcnow() + timedelta(seconds=REG_TOKEN_EXPIRED)
            query = insert(RegToken).values(token=token, email=email, expired_at=expired_at)
            if (await connection.execute(query)).rowcount:
                return token

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
                async with self.db.acquire() as connection:
                    return await connection.execute(query).rowcount > 0

    @classmethod
    def salt_string(cls, salt, value):
        hash = hashlib.sha512(value.encode('utf16'))
        hash.update(salt.encode('utf16'))
        return hashlib.sha256(hash.digest()).hexdigest()

    @classmethod
    async def factory(cls, options: argparse.Namespace):
        logging.basicConfig(level=(logging.DEBUG if options.debug else logging.WARNING))
        kwargs = dict((key, value) for key, value in options.__dict__.items() if
                      key in ('proxy_pass', 'postgres_url'))
        db_engine = await create_engine(kwargs.pop('postgres_url'))
        return cls(db_engine, logger=logging.root, **kwargs)


if __name__ == '__main__':
    import configargparse

    parser = configargparse.ArgumentParser("VideoRoom bakend")
    parser.add_argument('-c', '--config', is_config_file=True, help='config file path')
    parser.add_argument('-u', '--postgres-url', required=True, help='URL of Postgres', env_var='POSTGRES')
    parser.add_argument('-p', '--port', default=7000, help='served on port', env_var='BACKEND_PORT')
    parser.add_argument('-d', '--debug', default=False, action='store_true', help='debug mode', env_var='DEBUG')
    parser.add_argument('--proxy-pass', help='ProxyPass URL', env_var='PROXY_PASS')
    options, _ = parser.parse_known_args()
    web.run_app(WebApplication.factory(options), port=options.port)
