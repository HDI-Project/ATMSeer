from flask import current_app, g

from atm.config import load_config
from atm.database import Database

def get_db():
    """Connect to the application's configured database. The connection
    is unique for each request and will be reused if this is called
    again.
    """
    if 'db' not in g:
        sql_conf = current_app.config['SQL_CONF']
        g.db = Database(sql_conf.dialect, sql_conf.database, sql_conf.username,
                sql_conf.password, sql_conf.host, sql_conf.port,
                sql_conf.query)

    return g.db


def get_session():
    return get_db().get_session()


def teardown_db():
    db = g.pop('db', None)
    # Close db connection
    if db is not None:
        pass


def init_app(app):
    app.teardown_appcontext(teardown_db)
