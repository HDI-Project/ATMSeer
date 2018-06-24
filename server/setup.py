from setuptools import setup

setup(
    name='atm-vis',
    version='0.0.0',
    url='http://flask.pocoo.org/docs/tutorial/',
    install_requires=[
        'flask',
    ],
    entry_points={
        'console_scripts': [
            'atmvis=atm_vis:cli'
        ],
    },
)