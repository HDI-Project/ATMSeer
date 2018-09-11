import os
from atm_server import SERVER_ROOT


class Config(object):
    UPLOAD_FOLDER = 'atm/data'
    DATARUN_CONFIG_DIR = 'atm/run_config'
    DATASET_META_DIR = 'atm/dataset_meta'
    ALLOWED_EXTENSIONS = set(['csv'])
    RUN_CONFIG = os.path.join(SERVER_ROOT, './config/run.yaml')
    SQL_CONFIG = os.path.join(SERVER_ROOT, './config/sql.yaml')


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    pass


class TestingConfig(Config):
    pass
