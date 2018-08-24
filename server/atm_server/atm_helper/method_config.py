import os
import shutil
import json
import warnings
import atm
from atm.constants import METHOD_PATH, METHODS_MAP


DATARUN_METHOD_CONFIG_DIR = 'atm/run_config'


def get_datarun_config_path(datarun_id, method=None):
    config_path = os.path.join(DATARUN_METHOD_CONFIG_DIR, str(datarun_id))
    if method is None:
        return config_path
    if method in METHODS_MAP:
        config_path = os.path.join(config_path, METHODS_MAP[method])
        return config_path
    raise ValueError('Unknown method ', method)


def create_datarun_configs(datarun_id):
    config_path = get_datarun_config_path(datarun_id)
    shutil.copytree(METHOD_PATH, config_path)


def load_datarun_config(datarun_id, method=None):
    with datarun_config(datarun_id):
        config_path = get_datarun_config_path(datarun_id, method)
        if method is not None:
            with open(config_path) as f:
                return json.load(f)
    ret = {}
    for method in METHODS_MAP:
        ret[method] = load_datarun_config(datarun_id, method)
    return ret


def savedatarun_config(datarun_id, method, config):
    config_path = get_datarun_config_path(datarun_id, method)
    with open(config_path) as f:
        json.dump(config, f)


def update_datarun_config(datarun_id, method, hyperparameter_configs):
    assert isinstance(hyperparameter_configs, dict)
    config = load_datarun_config(datarun_id, method)
    hyperparmeters = config['hyperparameters']
    for hp, val in hyperparameter_configs.items():
        if hp not in hyperparmeters:
            warnings.warn('Trying to update unknown parameter %s for method %s' % (hp, method))
        if val['type'] != hyperparmeters[hp]['type']:
            raise ValueError('Hyperparameter type mismatch! Trying to update %s with type %s as type %s!' % (
                hp, hyperparmeters[hp]['type'], val['type']))
        hyperparmeters[hp] = val

    savedatarun_config(datarun_id, method, config)


class datarun_config:
    def __init__(self, datarun_id):
        self.datarun_id = datarun_id
        self.config_path = None
        self.default_path = METHOD_PATH

    def __enter__(self):
        self.config_path = get_datarun_config_path(self.datarun_id)
        if not os.path.exists(self.config_path):
            create_datarun_configs(self.datarun_id)
        atm.constants.METHOD_PATH = self.config_path
        return self

    def __exit__(self, type, error, traceback):
        atm.constants.METHOD_PATH = self.default_path
