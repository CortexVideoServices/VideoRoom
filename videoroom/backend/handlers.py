import json
from aiohttp import web
from cvs.web.utils import JSONEncoder
from . import Application, SignupError
from jwt4auth.aiohttp.handlers import authenticated

routes = web.RouteTableDef()


@routes.get('/state')
async def get_status(request: web.Request):
    app = request.app  # type: Application
    return web.json_response({'status': app.status, 'settings': app.settings})


@routes.post('/signup')
@routes.get('/signup/{token}')
@routes.post('/signup/{token}')
async def signup(request: web.Request):
    app = request.app  # type: Application
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
                    return web.json_response({'email': email})
            else:
                # stage #2 of signup
                password = data['password']
                display_name = data.get('display_name')
                if await app.signup_finish(token, display_name, password):
                    return web.HTTPCreated()
    except SignupError as exc:
        return web.HTTPBadRequest(reason=str(exc))
    return web.HTTPUnprocessableEntity()


@authenticated
@routes.get('/conference')
@routes.post('/conference')
async def conference(request: web.Request):
    app = request.app  # type: Application
    token_data = request['token_data']
    user_id = token_data['user_id']
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
        if await app.create_conference(user_id, display_name, description, allow_anonymous):
            return web.HTTPOk()
    else:
        if result := await app.get_conference(user_id):
            return web.json_response(result, dumps=lambda obj: json.dumps(obj, cls=JSONEncoder))
        return web.HTTPNotFound()
    return web.HTTPUnprocessableEntity()


@routes.get('/conference/{session_id}')
async def conference(request: web.Request):
    app = request.app  # type: Application
    session_id = request.match_info.get('session_id')
    if result := await app.get_conference_by_id(session_id):
        return web.json_response(result, dumps=lambda obj: json.dumps(obj, cls=JSONEncoder))
    return web.HTTPNotFound()
