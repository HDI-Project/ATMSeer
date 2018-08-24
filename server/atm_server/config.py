
class Config(object):
    UPLOAD_FOLDER = 'datasets'
    ALLOWED_EXTENSIONS = set(['csv'])


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    pass


class TestingConfig(Config):
    pass
