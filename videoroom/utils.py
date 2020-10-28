import aiosmtplib
from urllib.parse import urlparse, parse_qs
from typing import Union
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class ErrorWithInfo(Exception):
    """ Error with ext info
    """

    def __init__(self, message, **kwargs):
        super().__init__(self, message)
        self.ext_info = {'_class': self.__class__.__name__, '_message': message, **kwargs}


class Mailer(object):
    """ Sends mail
    """

    def __init__(self, cred: str):
        parts = urlparse(cred)
        tls = parse_qs(parts.query).get('tls', ['0'])[0].lower() in ('1', 'y', 'yes', 'true', 'on')
        start_tls = parse_qs(parts.query).get('start_tls', ['0'])[0].lower() in ('1', 'y', 'yes', 'true', 'on')
        port = parts.port or (587 if start_tls else (465 if tls else 25))
        self.kwargs = dict(hostname=parts.hostname, port=port, username=parts.username, password=parts.password)
        if start_tls:
            self.kwargs['start_tls'] = True
        elif tls:
            self.kwargs['use_tls'] = True

    async def send(self, from_: str, to: str, subject: str, body: Union[str, MIMEText]):
        message = MIMEMultipart()
        message["From"] = from_
        message["To"] = to
        message["Subject"] = subject
        if isinstance(body, MIMEText):
            message.attach(body)
        else:
            message.attach(MIMEText(body, 'plain', 'utf-8'))
        print('self.kwargs', self.kwargs)
        await aiosmtplib.send(message, **self.kwargs)
