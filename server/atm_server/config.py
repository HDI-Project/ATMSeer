
class Config(object):
    UPLOAD_FOLDER = 'atm/data'
    ALLOWED_EXTENSIONS = set(['csv'])


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    pass


class TestingConfig(Config):
    pass
