import os
import argparse
try:
    import simplejson as json
except ImportError:
    import json
from flask import Flask
from flask_cors import CORS

from atm.config import (add_arguments_aws_s3, add_arguments_sql,
                        add_arguments_datarun, add_arguments_logging,
                        load_config, initialize_logging)

from atm_server import SERVER_ROOT, db
from atm_server.config import Config, ProductionConfig, DevelopmentConfig
from atm_server.api import api
from atm_server.atmvis import vis


def create_app(config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    CORS(app)

    # Update configs
    if app.config['ENV'] == 'production':
        app.config.from_object(ProductionConfig)
    elif app.config['ENV'] == 'development':
        app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(Config)

    if config is None:
        config = {}
    config = {key: val for key, val in config.items() if val is not None}
    if config.get('run_config', None) is not None:
        config['RUN_CONFIG'] = config['run_config']
    if config.get('sql_config', None) is not None:
        config['SQL_CONFIG'] = config['sql_config']

    # print(config)
    app.config.update(config)

    # Load ATM confs
    sql_conf, run_conf, aws_conf, log_conf = load_config(**config)
    # print(run_conf.selector)
    # print(sql_conf)
    app.config.update({'SQL_CONF': sql_conf, 'RUN_CONF': run_conf, 'AWS_CONF': aws_conf, 'LOG_CONF': log_conf})
    app.config.update({'RUN_PER_PARTITION': config['run_per_partition']})

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    db.init_app(app)
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(vis, url_prefix='/')
    return app


def add_arguments_server(parser):
    parser.add_argument('--run-per-partition', default=False, action='store_true',
                        help='if set, generate a new datarun for each hyperpartition')

    # API flags
    parser.add_argument('--host', default='0.0.0.0', help='Port in which to run the API')
    parser.add_argument('--port', default=7777, help='Port in which to run the API')
    parser.add_argument('--debug', action="store_const", default=False, const=True,
                        help='If true, run Flask in debug mode')
    parser.add_argument('--reboot', action="store_const", default=False, const=True,
                        help='If true, when encountering a bug, it will shut down immediately.')


def start_server():

    # ATM flags
    parser = argparse.ArgumentParser()
    add_arguments_aws_s3(parser)
    add_arguments_sql(parser)
    add_arguments_datarun(parser)
    add_arguments_logging(parser)
    add_arguments_server(parser)

    _args = parser.parse_args()

    if _args.debug:
        os.environ['FLASK_ENV'] = 'development'

    app = create_app(vars(_args))

    app.run(
        debug=_args.debug,
        host=_args.host,
        port=int(_args.port)
    )


if __name__ == '__main__':
    start_server()
