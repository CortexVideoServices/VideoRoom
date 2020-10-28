import logging
import aiohttp
from aiohttp import web
from aiopg.sa import create_engine
from jwt4auth.aiohttp import with_prefix
from . import Application, AuthManager
from .handlers import routes


class WebApplication(Application):
    """ Backend web application
    """

    def __init__(self, prefix, jwt_secret, **kwargs):
        middlewares = kwargs.pop('middlewares', [])
        auth_manager = AuthManager(jwt_secret, use_cookie='jwt4auth')
        middlewares.append(auth_manager.middleware)
        settings = dict(prefix=prefix, api_url=kwargs.pop('api_url'), api_key=kwargs.pop('api_key'))
        super().__init__(settings, middlewares=middlewares, **kwargs)
        self.add_routes(with_prefix(prefix, routes))
        self.add_routes(with_prefix(prefix, auth_manager.routes))

    @classmethod
    async def factory(cls, postgres_dsn, prefix, api_url, api_key, jwt_secret, mailer, debug=False, **kwargs):
        db_engine = await create_engine(postgres_dsn)
        logging.basicConfig(level=(logging.DEBUG if debug else logging.WARNING))
        kwargs.update(dict(api_url=api_url, api_key=api_key, mailer=mailer))
        obj = cls(prefix, jwt_secret, logger=logging.root, **kwargs)
        obj['db_engine'] = db_engine
        async with aiohttp.ClientSession() as session:
            try:
                resp = await session.request('POST', api_url + '/v1/application',
                                             json=dict(id=api_key, jwt_secret=jwt_secret))
                if resp.status != 200:
                    raise ValueError(f"Wrong response status: ${resp.status}")
            except Exception as exc:
                message = f"SDK server unavailable: ${exc}"
                obj.logger.exception(message)
                raise RuntimeError(message)
        return obj


if __name__ == '__main__':
    import configargparse

    parser = configargparse.ArgumentParser("VideoRoom backend")
    parser.add_argument('-c', '--config', is_config_file=True, help='config file path')
    parser.add_argument('-x', '--prefix', default='/backend', help='URI prefix', env_var='PREFIX')
    parser.add_argument('-u', '--postgres-dsn', required=True, help='URL of Postgres', env_var='POSTGRES_DSN')
    parser.add_argument('-s', '--jwt-secret', help='JWT token secret', env_var='JWT_SECRET')
    parser.add_argument('-k', '--api-key', help='Application key to use SDK API', env_var='SDK_API_KEY')
    parser.add_argument('-a', '--api-url', help='URI to server SDK API', env_var='SDK_API_URL')
    parser.add_argument('-p', '--port', default=7000, help='served on port', env_var='BACKEND_PORT')
    parser.add_argument('-m', '--mailer', help='mailer for send email', env_var='MAILER')
    parser.add_argument('-d', '--debug', default=False, action='store_true', help='debug mode', env_var='DEBUG')
    options, _ = parser.parse_known_args()
    web.run_app(WebApplication.factory(options.postgres_dsn,
                                       prefix=options.prefix,
                                       api_url=options.api_url,
                                       api_key=options.api_key,
                                       jwt_secret=options.jwt_secret,
                                       mailer=options.mailer,
                                       debug=options.debug), port=options.port)
