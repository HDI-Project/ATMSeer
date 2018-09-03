import os
import shutil
import json
import yaml
import copy
import warnings
from flask import current_app
from sqlalchemy.exc import IntegrityError
import atm
from atm.method import Method
from atm.utilities import object_to_base_64
from atm.constants import METHODS_MAP, PartitionStatus
from atm.config import RunConfig

from atm_server.db import get_db
from atm_server.error import ApiError


# DATARUN_METHOD_CONFIG_DIR = 'atm/run_config'

DEFAULT_METHOD_PATH = atm.constants.METHOD_PATH


def get_datarun_config_path(datarun_id, method=None):
    config_path = os.path.join(current_app.config['DATARUN_CONFIG_DIR'], str(datarun_id))
    if method is None:
        return config_path
    if method in METHODS_MAP:
        config_path = os.path.join(config_path, METHODS_MAP[method])
        return config_path
    raise ValueError('Unknown method ', method)


def create_datarun_configs(datarun_id):
    config_path = get_datarun_config_path(datarun_id)
    # Copy default configuration
    shutil.copytree(DEFAULT_METHOD_PATH, config_path)
    # Copy default run configuration
    shutil.copy(current_app.config['RUN_CONFIG'], config_path)

def load_datarun_config_dict(datarun_id=None):
    """
    Load the run config (i.e., run.yaml) of a datarun.
    If datarun_id is None, load the default run config (i.e., config/run.yaml)
    Return a dict
    """
    if datarun_id is None:
        config_path = current_app.config['RUN_CONFIG']
    else:
        config_path = get_datarun_config_path(datarun_id)
        config_path = os.path.join(config_path, 'run.yaml')
    run_args = {}
    with open(config_path) as f:
        run_args = yaml.load(f)
    return run_args

def load_datarun_config(datarun_id=None):
    """
    Load the run config (i.e., run.yaml) of a datarun.
    If datarun_id is None, load the default run config (i.e., config/run.yaml)
    Return a RunConfig Object
    """
    run_args = load_datarun_config_dict(datarun_id)

    if datarun_id is not None:
        # The values in db might be different
        db = get_db()
        datarun = db.get_datarun(datarun_id)
        run_args.update({key: getattr(datarun, key) for key in RunConfig.DEFAULTS if hasattr(datarun, key)})

    run_conf = RunConfig(**run_args)
    return run_conf


def update_datarun_config(datarun_id, config):
    """
    Update the "run_config" of a datarun.
    Note: new methods will not be added (If they are not exist in the config when the datarun is created)
    :param datarun_id:
    :param config:
    """

    # Now update the fields in db so that configs really changes
    db = get_db()
    try:
        # First update the dataruns table
        datarun = db.get_datarun(datarun_id)
        # describe the datarun by its tuner and selector
        myconfig = copy.deepcopy(config)
        tuner = myconfig.get("tuner", datarun.tuner)
        selector = myconfig.get("selector", datarun.selector)
        myconfig["description"] = '__'.join([tuner, selector])
        if "score_target" in myconfig:
            myconfig["score_target"] = myconfig["score_target"] + '_judgment_metric'
        for key, val in myconfig.items():
            if val is None:
                continue
            if hasattr(datarun, key):
                setattr(datarun, key, val)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        raise ApiError(e, 400)
    except:
        db.session.rollback()
        raise

    if 'methods' in config:

        try:
            # Then update the hyperpartitions
            methods = set(config['methods'])
            query = db.session.query(db.Hyperpartition)
            query = query.filter(db.Hyperpartition.datarun_id == datarun_id)
            query = query.filter(db.Hyperpartition.status != PartitionStatus.GRIDDING_DONE)
            query = query.filter(db.Hyperpartition.method.notin_(methods))
            query.update({db.Hyperpartition.status: PartitionStatus.ERRORED}, synchronize_session=False)

            query = db.session.query(db.Hyperpartition)
            query = query.filter(db.Hyperpartition.datarun_id == datarun_id)
            query = query.filter(db.Hyperpartition.status != PartitionStatus.GRIDDING_DONE)
            query = query.filter(db.Hyperpartition.method.in_(methods))
            query.update({db.Hyperpartition.status: PartitionStatus.INCOMPLETE}, synchronize_session=False)

            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            raise ApiError(e, 400)
        except:
            db.session.rollback()
            raise
    # Update the config file as well
    config_path = get_datarun_config_path(datarun_id)
    config_path = os.path.join(config_path, 'run.yaml')
    with open(config_path, 'r') as f:
        run_args = yaml.load(f)

    run_args.update(config)
    print(run_args)
    with open(config_path, 'w') as f:
        yaml.dump(run_args, f)
    return True


def load_datarun_method_config(datarun_id, method=None):
    """
    Load the method configs (e.g., adaboost.json) of a datarun.
    If method is None, a dict of {method: config} will be returned
    :param datarun_id:
    :param method: method string (the keys of atm.constants.METHODS_MAP)
    :return:
    """
    with datarun_config(datarun_id):
        config_path = get_datarun_config_path(datarun_id, method)
        if method is not None:
            with open(config_path) as f:
                return json.load(f)
    ret = {}
    for method in METHODS_MAP:
        ret[method] = load_datarun_method_config(datarun_id, method)
    return ret


def save_datarun_method_config(datarun_id, method, config):
    """Save the config of a method of a datarun"""
    config_path = get_datarun_config_path(datarun_id, method)
    with open(config_path, 'w') as f:
        json.dump(config, f)


def update_datarun_method_config(datarun_id, method, hyperparameter_configs):
    """
    Update the config of a method of a datarun by only providing the hyperparameters.
    This method would also do some simple legality check on the provided hyperparameters.
    The argument hyperparameter_configs is a dict like:
        {hp: {'type': ..., 'range': ...}})
    """
    assert isinstance(hyperparameter_configs, dict)
    config = load_datarun_method_config(datarun_id, method)
    hyperparmeters = config['hyperparameters']
    for hp, val in hyperparameter_configs.items():
        if hp not in hyperparmeters:
            warnings.warn('Trying to update unknown parameter %s for method %s' % (hp, method))
        if val['type'] != hyperparmeters[hp]['type']:
            raise ValueError('Hyperparameter type mismatch! Trying to update %s with type %s as type %s!' % (
                hp, hyperparmeters[hp]['type'], val['type']))
        hyperparmeters[hp] = val

    _method = Method(method)
    parts = _method.get_hyperpartitions()
    save_datarun_method_config(datarun_id, method, config)

    db = get_db()
    for part in parts:
        # if necessary, create a new datarun for each hyperpartition.
        # This setting is useful for debugging.

        # create a new hyperpartition in the database
        query = db.session.query(db.Hyperpartition).filter(db.Hyperpartition.datarun_id == datarun_id)
        query = query.filter(db.Hyperpartition.method == method)
        # We assume that the categorical and constants are fixed
        query = query.filter(db.Hyperpartition.categorical_hyperparameters_64 == object_to_base_64(part.categoricals))
        query = query.filter(db.Hyperpartition.constant_hyperparameters_64 == object_to_base_64(part.constants))
        query = query.filter(db.Hyperpartition.tunable_hyperparameters_64 != object_to_base_64(part.tunables))

        hps = list(query.all())
        if len(hps) == 1:
            hp = hps[0]
            hp.tunables = part.tunables
        elif len(hps) > 1:
            raise ValueError('Multiple hyperpartitions found!')
    db.session.commit()


class datarun_config:
    def __init__(self, datarun_id):
        self.datarun_id = datarun_id
        self.config_path = None
        self.default_path = DEFAULT_METHOD_PATH
        self._run_config = None
        self._method_config = None

    def __enter__(self):
        self.config_path = get_datarun_config_path(self.datarun_id)
        if not os.path.exists(self.config_path):
            create_datarun_configs(self.datarun_id)
        # Temporarily change the path
        atm.constants.METHOD_PATH = self.config_path
        return self

    @property
    def run_config(self):
        if self._run_config is None:
            # Lazy loading
            self._run_config = load_datarun_config(self.datarun_id)
        return self._run_config

    def update_run_config(self, config):
        update_datarun_config(self.datarun_id, config)
        # Reset the _run_config to None
        self._run_config = None

    def load_method_config(self, method=None):
        return load_datarun_method_config(self.datarun_id, method)

    def update_method_config(self, method, hyperparameters):
        update_datarun_method_config(self.datarun_id, method, hyperparameters)

    def __exit__(self, type, error, traceback):
        atm.constants.METHOD_PATH = self.default_path
