# created by jobliz
import os
import copy
import uuid
import decimal
import datetime
import argparse
try: 
    import simplejson as json
except ImportError: 
    import json
from sqlalchemy import inspect
from subprocess import Popen, PIPE
import flask
from flask import request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename

from atm.database import Database
from atm.enter_data import enter_data
from atm.config import (add_arguments_aws_s3, add_arguments_sql,
                        add_arguments_datarun, add_arguments_logging,
                        load_config, initialize_logging)

from atm_server.db import get_db, get_session

api = Blueprint('api', __name__)

def nice_json_encoder(base_encoder):


    class JSONEncoder(base_encoder):
        """
        JSONEncoder subclass that knows how to encode date/time, decimal types, and UUIDs.
        See: https://stackoverflow.com/questions/11875770/how-to-overcome-datetime-datetime-not-json-serializable
        """
        def default(self, o):
            # See "Date Time String Format" in the ECMA-262 specification.
            if isinstance(o, datetime.datetime):
                r = o.isoformat()
                if o.microsecond:
                    r = r[:23] + r[26:]
                if r.endswith('+00:00'):
                    r = r[:-6] + 'Z'
                return r
            elif isinstance(o, datetime.date):
                return o.isoformat()
            elif isinstance(o, datetime.time):
                if o.utcoffset() is not None:
                    raise ValueError("JSON can't represent timezone-aware times.")
                r = o.isoformat()
                if o.microsecond:
                    r = r[:12]
                return r
            elif isinstance(o, (decimal.Decimal, uuid.UUID)):
                return str(o)
            elif isinstance(o, bytes):  
                return str(o, encoding='utf-8')
            else:
                return super(JSONEncoder, self).default(o)

    return JSONEncoder

sysJSONEncoder = nice_json_encoder(json.JSONEncoder)
flaskJSONEnCoder = nice_json_encoder(flask.json.JSONEncoder)

class ApiError(Exception):
    """
    API error handler Exception
    See: http://flask.pocoo.org/docs/0.12/patterns/apierrors/
    """
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def table_fetcher(table):
    """
    Creates a generic controller function to view the full contents of a table.
    """

    def inner():
        result = get_db().engine.execute(''.join(['SELECT * FROM ', table]))
        return json.dumps([dict(row) for row in result])

    return inner


def object_as_dict(obj):
    return {c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs}


def entity_fetcher(entity_name, field, one=False):
    """
    Creates a generic controller function to filter the entity by the value of one field.
    Uses simplejson (aliased to json) to parse Decimals and the custom JSONEncoder to parse
    datetime fields.
    """

    def inner(**args):
        value = args[field]
        kwargs = {field: value}
        
        db = get_db()
        session = db.get_session()

        entity = getattr(db, entity_name, None)
        if entity is None:
            raise ApiError('No entity named %s' % entity_name, status_code=404, payload={})
        try:
            if one:
                result = session.query(entity).filter_by(**kwargs).one()
                return json.dumps((object_as_dict(result)), cls=sysJSONEncoder)
            else:
                result = session.query(entity).filter_by(**kwargs).all()
                return json.dumps([object_as_dict(item) for item in result], cls=sysJSONEncoder)

        except Exception:
            raise ApiError('Not found', status_code=404, payload={})

    return inner


def allowed_file(filename):
    """
    Checks if filename ends with an allowed file extension.
    See: http://flask.pocoo.org/docs/0.12/patterns/fileuploads/
    """
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def execute_in_virtualenv(virtualenv_name, script):
    """
    Executes a Python script inside a virtualenv.
    See: https://gist.github.com/turicas/2897697
    General idea:
    /bin/bash -c "source venv/bin/activate && python /home/jose/code/python/ATM/worker.py"
    """
    path = ''.join([os.path.dirname(os.path.abspath(__file__)), script])
    command = ''.join(['/bin/bash -c "source venv/bin/activate && python ', path, '"'])
    process = Popen(command, stdin=PIPE, stdout=PIPE, stderr=PIPE, shell=True)
    return process


@api.errorhandler(ApiError)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

api.json_encoder = flaskJSONEnCoder

# routes to find all records
api.add_url_rule('/datasets', 'all_datasets', table_fetcher('datasets'), methods=['GET'])
api.add_url_rule('/dataruns', 'all_dataruns', table_fetcher('dataruns'), methods=['GET'])
api.add_url_rule('/hyperpartitions', 'all_hyperpartitions', table_fetcher('hyperpartitions'), methods=['GET'])
api.add_url_rule('/classifiers', 'all_classifiers', table_fetcher('classifiers'), methods=['GET'])

# routes to find entity by it's own id
api.add_url_rule('/dataruns/<int:id>', 'datarun_by_id',
                    entity_fetcher('Datarun', 'id', one=True), methods=['GET'])
api.add_url_rule('/datasets/<int:id>', 'dataset_by_id',
                    entity_fetcher('Dataset', 'id', one=True), methods=['GET'])
api.add_url_rule('/classifiers/<int:id>', 'classifier_by_id',
                    entity_fetcher('Classifier', 'id', one=True), methods=['GET'])
api.add_url_rule('/hyperpartitions/<int:id>', 'hyperpartition_by_id',
                    entity_fetcher('Hyperpartition', 'id', one=True), methods=['GET'])

# routes to find entities associated with another entity
api.add_url_rule('/dataruns/dataset/<int:dataset_id>', 'datarun_by_dataset_id',
                    entity_fetcher('Datarun', 'dataset_id'), methods=['GET'])
api.add_url_rule('/hyperpartitions/datarun/<int:datarun_id>', 'hyperpartition_by_datarun_id',
                    entity_fetcher('Hyperpartition', 'datarun_id'), methods=['GET'])
api.add_url_rule('/classifiers/datarun/<int:datarun_id>', 'classifier_by_datarun_id',
                    entity_fetcher('Classifier', 'datarun_id'), methods=['GET'])
api.add_url_rule('/classifiers/hyperpartition/<int:hyperpartition_id>', 'classifier_by_hyperpartition_id',
                    entity_fetcher('Classifier', 'hyperpartition_id'), methods=['GET'])

# route to post a new CSV file and create a datarun with enter_data
@api.route('/enter_data', methods=['POST'])
def post_enter_data():
    """
    Receives and saves a CSV file, after which it executes the enter_data function.
    See: http://flask.pocoo.org/docs/0.12/patterns/fileuploads/
    """
    if 'file' not in request.files:
        raise ApiError('No file part', status_code=400)

    file = request.files['file']

    # if user does not select file, browser also submits an empty part without filename
    if file.filename == '':
        raise ApiError('Empty file part', status_code=400)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        rel_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        abs_filepath = os.path.abspath(rel_filepath)
        file.save(rel_filepath)

        run_conf = current_app.config['RUN_CONF']
        sql_conf = current_app.config['SQL_CONF']
        aws_conf = current_app.config['AWS_CONF']
        run_per_partition =current_app.config['RUN_PER_PARTITION']
        # we need to set a customized train_path but without modifying the
        # global run_conf object, so we deepcopy the run_conf object

        upload_run_conf = copy.deepcopy(run_conf)
        upload_run_conf.train_path = abs_filepath

        enter_data(sql_conf, upload_run_conf, aws_conf, run_per_partition)

        return json.dumps({'success': True})

# route to activate a single worker
@api.route('/simple_worker', methods=['GET'])
def dispatch_worker():
    """
    Executes the worker.py script inside a virtualenv and returns stdout and stderr
    as response.
    Note: It currently only works if rest_api_server.py file is in the same
    directory as the worker.py script.
    """
    process = execute_in_virtualenv('venv', '/worker.py')
    stdout, stderr = process.communicate()

    return jsonify({
        'stdout': stdout,
        'stderr': stderr
    })
