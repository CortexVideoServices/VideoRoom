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
        'CVS',
        'jwt4auth>=0.1.5',
        'aiohttp==3.7.2',
        'configargparse',
        'SQLAlchemy==1.3.15',
        'psycopg2-binary==2.8.4',
        'aiopg==1.0.0',
        'aiosmtplib==1.1.1',
        'alembic',
    ],
    'dependency_links': ['git+https://github.com/Alesh/jwt4auth.git#egg=jwt4auth']
}

setup(**settings)