import sys
from setuptools import setup, find_namespace_packages

settings = {
    'name': 'VideoRoom',
    'version_config': {
        'version_style': {
            'metadata': True,
            'dirty': True,
        }
    },
    'setup_requires': ['setuptools-vcs-version'],
    'packages': find_namespace_packages(),
    'install_requires': [
        'jwt4auth',
        'aiohttp==3.6.2',
        'configargparse',
        'SQLAlchemy==1.3.15',
        'psycopg2-binary==2.8.4',
        'aiopg==1.0.0',
        'aiosmtplib==1.1.1'
    ]
}

if 'develop' in sys.argv:
    settings['install_requires'].extend([
        'alembic',
    ])

setup(**settings)