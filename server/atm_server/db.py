from collections import defaultdict
import numpy as np
from flask import current_app, g
from sqlalchemy import inspect

from atm.database import Database, db_session
from atm.constants import ClassifierStatus

from .error import ApiError


def get_db():
    """Connect to the application's configured database. The connection
    is unique for each request and will be reused if this is called
    again.
    """
    if 'db' not in g:
        sql_conf = current_app.config['SQL_CONF']
        db = Database(sql_conf.dialect, sql_conf.database, sql_conf.username,
                        sql_conf.password, sql_conf.host, sql_conf.port,
                        sql_conf.query)
        if g.db.Hyperpartition.classifiers

        g.db = db
    return g.db


def teardown_db(e=None):
    db = g.pop('db', None)
    # Close db connection
    if db is not None:
        pass


def init_app(app):
    app.teardown_appcontext(teardown_db)


# Querying & Post-processing Methods

def object_as_dict(obj):
    return {c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs}


def fetch_entity(entity_name, filters=None, one=False):
    """
    Fetch an entity (table) form the database.
    :param entity_name: the name of the entity, should be a table in the database.
    :param filters: a dict specifying the filters
    :param one: a boolean, if True, then only one result is returned or an exception will be raised.
    :return: A dict representing the entity or a list of dicts.
    """
    db = get_db()

    entity = getattr(db, entity_name, None)
    if entity is None:
        raise ApiError('No entity named %s in the database' % entity_name, status_code=404)
    if filters is None:
        filters = {}
    else:
        # Remove None valued keys
        filters = {key: val for key, val in filters.items() if val is not None}
    try:
        with db_session(db):
            if one:
                result = db.session.query(entity).filter_by(**filters).one()
                return object_as_dict(result)
            else:
                result = db.session.query(entity).filter_by(**filters).all()
                return [object_as_dict(item) for item in result]

    except Exception:
        raise ApiError('Not found', status_code=404)


def table_fetcher(table):
    """
    Creates a generic controller function to view the full contents of a table.
    """

    def inner():
        result = get_db().engine.execute(''.join(['SELECT * FROM ', table]))
        return [dict(row) for row in result]

    return inner


def metric_string(model, target):
    """ Stringify the metric of a model, Copied from atm/database.py """
    if 'cv' in target or 'mu_sigma' in target:
        return '%.3f +- %.3f' % (model.cv_judgment_metric,
                                 2 * model.cv_judgment_metric_stdev)
    else:
        return '%.3f' % model.test_judgment_metric


def params_string(params):
    return '; '.join(['%s = %s' % (k, params[k]) for k in sorted(params.keys())])

def hyperpartition_string(hp):
    cats = [hp.method]
    for cat_key, cat_value in hp.categoricals:
        if type(cat_value) is str:
            cats.append(cat_value)
        elif cat_value:
            cats.append(cat_key)
    return '-'.join(cats)


def summarize_classifiers(dataset_id=None, datarun_id=None, hyperpartition_id=None, method=None):
    """
    Get the summarized information about classifiers, filtered by the passed-in arguments.
    The header of the csv:
        trail ID, method, parameters, metrics, score target, performance
    """
    db = get_db()
    with db_session(db):
        query = db.session.query(
            db.Classifier,
            db.Hyperpartition.method,
            db.Datarun.metric,
            db.Datarun.score_target)\
            .select_from(db.Classifier)\
            .join(db.Classifier.hyperpartition)\
            .join(db.Classifier.datarun)\
            .filter(db.Classifier.status == ClassifierStatus.COMPLETE)

        # query = db.session.query(
        #     db.Classifier,
        #     db.Hyperpartition.method,
        #     db.Datarun.metric,
        #     db.Datarun.score_target)\
        #     .filter(db.Classifier.hyperpartition_id == db.Hyperpartition.id)\
        #     .filter(db.Classifier.datarun_id == db.Datarun.id)\
        #     .filter(db.Classifier.status == ClassifierStatus.COMPLETE)
        if dataset_id is not None:
            query = query.filter(db.Datarun.dataset_id == dataset_id)
        if datarun_id is not None:
            query = query.filter(db.Classifier.datarun_id == datarun_id)
        if method is not None:
            query = query.filter(db.Hyperpartition.method == method)
        if hyperpartition_id is not None:
            query = query.filter(db.Classifier.hyperpartition_id ==
                                 hyperpartition_id)

        return [['trail ID', 'method', 'parameters', 'metrics', 'score target', 'performance']] + [
            [
                str(classifier.id),
                method,
                params_string(classifier.hyperparameter_values),
                metric,
                score_target[:-len('_judgment_metric')],
                metric_string(classifier, score_target)
            ] for classifier, method, metric, score_target in query.all()]


def fetch_dataset_path(dataset_id, train=True):
    db = get_db()
    try:
        with db_session(db):
            dataset = db.get_dataset(dataset_id)
            return dataset.train_path if train else dataset.test_path

    except Exception:
        raise ApiError('Not found', status_code=404)


def summarize_datarun(datarun_id, classifier_start=None, classifier_end=None):
    db = get_db()
    datarun = db.get_datarun(datarun_id)

    with db_session(db):
        query = db.session.query(
            db.Classifier,
            db.Hyperpartition.method)\
            .filter(db.Classifier.hyperpartition_id == db.Hyperpartition.id)\
            .filter(db.Classifier.status == ClassifierStatus.COMPLETE)\
            .filter(db.Classifier.datarun_id == datarun_id)
        classifiers, methods = zip(*query.all())
        classifiers = classifiers[classifier_start:classifier_end]
        methods = methods[classifier_start:classifier_end]
        if 'cv' in datarun.score_target or 'mu_sigma' in datarun.score_target:
            scores = [c.cv_judgment_metric for c in classifiers]
        else:
            scores = [c.test_judgment_metric for c in classifiers]

        best_idx = int(np.argmax(scores))
        best_classifier = classifiers[best_idx]
        best_score = scores[best_idx]
        method_tries = defaultdict(int)
        for method in methods:
            method_tries[method] += 1

        return {
            'n_classifiers': len(scores),
            'best_score': best_score,
            'best_method': methods[best_idx],
            'best_classifier_id': best_classifier.id,
            'method_tries': method_tries
            # 'best_classifier': best_classifier.
            # 'best_idx':
        }


def fetch_classifiers(classifier_id=None, dataset_id=None, datarun_id=None, hyperpartition_id=None,
                      method=None, status=None, nice=True):
    db = get_db()
    if classifier_id is not None:
        classifiers = [db.get_classifier(classifier_id)]
    else:
        classifiers = db.get_classifiers(dataset_id, datarun_id, method, hyperpartition_id, status)
    if nice is False:
        return [object_as_dict(item) for item in classifiers]
    hyperpartitions = db.get_hyperpartitions(dataset_id, datarun_id, method,
                                             ignore_gridding_done=False,
                                             ignore_errored=False)
    hp_id2method = {hp.id: hp.method for hp in hyperpartitions}

    return [
        {
            'id': c.id,
            'datarun_id': c.datarun_id,
            'hyperpartition_id': c.hyperpartition_id,
            'method': hp_id2method[c.hyperpartition_id],
            'cv_metric': float(c.cv_judgment_metric),
            'cv_metric_std': float(c.cv_judgment_metric_stdev),
            'test_metric': float(c.test_judgment_metric),
            'hyperparameters': c.hyperparameter_values,
            'status': c.status,
            'start_time': c.start_time,
            'end_time': c.end_time
        }
        for c in classifiers
    ]


def fetch_hyperpartitions(hyperpartition_id=None, dataset_id=None, datarun_id=None,
                          method=None, nice=True):
    db = get_db()
    if hyperpartition_id is not None:
        hyperpartitions = [db.get_hyperpartition(hyperpartition_id)]
    else:
        hyperpartitions = db.get_hyperpartitions(dataset_id, datarun_id, method,
                                                 ignore_gridding_done=False,
                                                 ignore_errored=False)
    if nice is False:
        return [object_as_dict(item) for item in hyperpartitions]

    print(hyperpartitions[0].categoricals)
    print(hyperpartitions[0].tunables)
    print(hyperpartitions[0].constants)
    return [
        {
            'id': hp.id,
            'datarun_id': hp.datarun_id,
            'method': hp.method,
            'hyperpartition_string': hyperpartition_string(hp),
            'categoricals': {cat_key: cat_value for cat_key, cat_value in hp.categoricals},
            'tunables': {key: value for key, value in hp.tunables},
            'constant': {key: value for key, value in hp.constants},
            'status': hp.status,
        }
        for hp in hyperpartitions
    ]
