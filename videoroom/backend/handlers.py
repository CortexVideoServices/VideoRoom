from aiohttp import web
from . import Application, SignupError

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
