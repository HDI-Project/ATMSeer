from flask import current_app, g
from sqlalchemy import inspect

from atm.database import Database, db_session

from .error import ApiError


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


def teardown_db():
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
            .filter(db.Classifier.hyperpartition_id == db.Hyperpartition.id)\
            .filter(db.Classifier.datarun_id == db.Datarun.id)
        if dataset_id is not None:
            query = query.join(db.Datarun) \
                .filter(db.Datarun.dataset_id == dataset_id)
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

