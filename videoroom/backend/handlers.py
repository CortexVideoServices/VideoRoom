import json
from aiohttp import web
from cvs.web.utils import JSONEncoder
from . import Application
from jwt4auth.aiohttp import authenticated

routes = web.RouteTableDef()


@routes.get('/state')
async def get_status(request: web.Request):
    app = request.app  # type: Application
    return web.json_response({'status': app.status, 'settings': app.settings})


@routes.post('/signup')
@routes.post('/renew')
@routes.get('/signup/{token}')
@routes.get('/renew/{token}')
@routes.post('/signup/{token}')
@routes.post('/renew/{token}')
async def signup(request: web.Request):
    app = request.app  # type: Application
    token = request.match_info.get('token')
    if request.content_type.startswith('application/json'):
        data = await request.json()
    else:
        data = await request.post()
    if not token:
        # Stage #1 of account registration
        email = data['email']
        start_coro = app.signup_start(email) if request.path.endswith('/signup') else app.renew_start(email)
        if await start_coro:
            return web.HTTPOk()
    else:
        if request.method != 'POST':
            email_coro = app.signup_email(token) if '/signup/' in request.path else app.renew_email(token)
            email = await email_coro
            if email:
                return web.json_response({'email': email})
        else:
            # stage #2 of signup
            password = data['password']
            if '/signup/' in request.path:
                display_name = data.get('display_name')
                finish_coro = app.signup_finish(token, display_name, password)
            else:
                finish_coro = app.renew_finish(token, password)
            if await finish_coro:
                return web.HTTPCreated()
    return web.HTTPUnprocessableEntity()


@authenticated
@routes.get('/conference')
@routes.post('/conference')
async def conference(request: web.Request):
    app = request.app  # type: Application
    user_data = request['user_data']
    user_id = user_data['user_id']
    if request.method == 'POST':
        if request.content_type.startswith('application/json'):
            data = await request.json()
        else:
            data = await request.post()
        try:
            allow_anonymous = data['allow_anonymous']
            display_name = data['display_name']
            description = data['description']
        except KeyError as exc:
            raise web.HTTPBadRequest(reason=str(exc))
        if result := await app.create_conference(user_id, display_name, description, allow_anonymous):
            return web.json_response(result, status=201, dumps=lambda obj: json.dumps(obj, cls=JSONEncoder))
    else:
        if result := await app.get_conference(user_id):
            return web.json_response(result, dumps=lambda obj: json.dumps(obj, cls=JSONEncoder))
        return web.HTTPNotFound()
    return web.HTTPUnprocessableEntity()


@routes.get('/conference/{session_id}')
async def conference(request: web.Request):
    app = request.app  # type: Application
    session_id = request.match_info.get('session_id')
    user_data = request.get('user_data')
    if result := await app.get_conference_by_id(session_id):
        if user_data is None and not result['allow_anonymous']:
            return web.json_response({'allow_anonymous': False})
        return web.json_response(result, dumps=lambda obj: json.dumps(obj, cls=JSONEncoder))
    return web.HTTPNotFound()
