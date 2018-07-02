import os
import sys
import copy

import argparse
from io import StringIO

from multiprocessing import Process, Pipe
from flask import request, jsonify, Blueprint, current_app, Response
from werkzeug.utils import secure_filename

import atm
from atm.worker import work
from atm.database import Database
from atm.enter_data import enter_data
from atm.config import (add_arguments_aws_s3, add_arguments_sql,
                        add_arguments_datarun, add_arguments_logging,
                        load_config, initialize_logging)

from .db import fetch_entity, summarize_classifiers
from .utils import flaskJSONEnCoder
from .error import ApiError

api = Blueprint('api', __name__)


def allowed_file(filename):
    """
    Checks if filename ends with an allowed file extension.
    See: http://flask.pocoo.org/docs/0.12/patterns/fileuploads/
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def return_stdout_stderr(f):
    """
    A decorator that stores the stdout and stderr during a function run.
    :param f: a function
    :return: a tuple of (stdout_str, stderr_str, return_of_f)
    """
    def inner(*args, **kwargs):
        stdout_p = StringIO()
        stderr_p = StringIO()
        sys.stdout = stdout_p
        sys.stderr = stderr_p

        try:
            ret = f(*args, **kwargs)
        except:
            ret = None

        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__
        stdout = stdout_p.getvalue()
        stderr = stderr_p.getvalue()
        stdout_p.close()
        stderr_p.close()
        return stdout, stderr, ret

    return inner


@return_stdout_stderr
def start_worker(*args):
    """
    A copy of the code in atm/scripts/worker.py
    A call to this function will start and run a simple worker
    """

    parser = argparse.ArgumentParser(description='Add more classifiers to database')
    add_arguments_sql(parser)
    add_arguments_aws_s3(parser)
    add_arguments_logging(parser)

    # add worker-specific arguments
    parser.add_argument('--cloud-mode', action='store_true', default=False,
                        help='Whether to run this worker in cloud mode')
    parser.add_argument('--dataruns', help='Only train on dataruns with these ids',
                        nargs='+')
    parser.add_argument('--time', help='Number of seconds to run worker', type=int)
    parser.add_argument('--choose-randomly', action='store_true',
                        help='Choose dataruns to work on randomly (default = sequential order)')
    parser.add_argument('--no-save', dest='save_files', default=True,
                        action='store_const', const=False,
                        help="don't save models and metrics at all")

    # parse arguments and load configuration
    _args = parser.parse_args(*args)

    # default logging config is different if initialized from the command line
    if _args.log_config is None:
        _args.log_config = os.path.join(atm.PROJECT_ROOT,
                                        'config/templates/log-script.yaml')

    sql_config, _, aws_config, log_config = load_config(**vars(_args))
    initialize_logging(log_config)

    # let's go
    work(db=Database(**vars(sql_config)),
         datarun_ids=_args.dataruns,
         choose_randomly=_args.choose_randomly,
         save_files=_args.save_files,
         cloud_mode=_args.cloud_mode,
         aws_config=aws_config,
         log_config=log_config,
         total_time=_args.time,
         wait=False)


@api.errorhandler(ApiError)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


# inject a more powerful jsonEncoder
api.json_encoder = flaskJSONEnCoder


# Wrap the return as a json response
def fetch_entity_as_json(*args, **kwargs):
    return jsonify(fetch_entity(*args, **kwargs))


######################
# API Starts here
######################


@api.route('/datasets', methods=['GET'])
def fetch_datasets():
    """Fetch the info of all datasets"""
    return fetch_entity_as_json('Dataset')


@api.route('/datasets/<int:dataset_id>', methods=['GET'])
def fetch_dataset(dataset_id):
    """Fetch the info of a dataset by id"""
    return fetch_entity_as_json('Dataset', {'id': dataset_id}, True)


@api.route('/dataruns', methods=['GET'])
def fetch_dataruns():
    """
    Fetch the info of dataruns. A query parameter of dataset_id is supported.
    E.g.: /api/dataruns?dataset_id=1
    """
    dataset_id = request.args.get('dataset_id', None, type=int)
    return fetch_entity_as_json('Datarun', {'dataset_id': dataset_id})


@api.route('/dataruns/<int:datarun_id>', methods=['GET'])
def fetch_datarun(datarun_id):
    """Fetch the info of a datarun by id"""
    return fetch_entity_as_json('Datarun', {'id': datarun_id}, True)


@api.route('/hyperpartitions', methods=['GET'])
def fetch_hyperpartitions():
    """
    Fetch the info of hyperpartitions.
    E.g.: /api/hyperpartitions?dataset_id=1&datarun_id=1
    """
    dataset_id = request.args.get('dataset_id', None, type=int)
    datarun_id = request.args.get('datarun_id', None, type=int)
    return fetch_entity_as_json('Hyperpartition', {'dataset_id': dataset_id, 'datarun_id': datarun_id})


@api.route('/hyperpartitions/<int:hyperpartition_id>', methods=['GET'])
def fetch_hyperpartition(hyperpartition_id):
    """Fetch the info of a hyperpartition by id"""
    return fetch_entity_as_json('hyperpartition', {'id': hyperpartition_id}, True)


@api.route('/classifiers', methods=['GET'])
def fetch_classifiers():
    """
    Fetch the info of classifiers.
    E.g.: /api/classifiers?datarun_id=1&hyperpartition_id=1
    """
    datarun_id = request.args.get('datarun_id', None, type=int)
    hyperpartition_id = request.args.get('hyperpartition_id', None, type=int)
    return fetch_entity_as_json('Classifier', {'datarun_id': datarun_id,
                                               'hyperpartition_id': hyperpartition_id})


@api.route('/classifiers/<int:classifier_id>', methods=['GET'])
def fetch_classifier(classifier_id):
    """Fetch the info of a classifier by id"""
    return fetch_entity_as_json('Classifier', {'id': classifier_id}, True)


@api.route('/classifier_summary', methods=['GET'])
def classifier_summary():
    """
    Summarize the classifiers as a csv.
    For the fields in the csv, see `atm_server.db:summarize_classifiers` for details.
    E.g.: /api/classifier_summary?datarun_id=1
    """
    dataset_id = request.args.get('datarset_id', None, type=int)
    datarun_id = request.args.get('datarun_id', None, type=int)
    hyperpartition_id = request.args.get('hyperpartition_id', None, type=int)
    method = request.args.get('method', None, type=str)
    csv_data = summarize_classifiers(dataset_id, datarun_id, hyperpartition_id=hyperpartition_id, method=method)

    def generate():
        for row in csv_data:
            yield ','.join(row) + '\n'
    return Response(generate(), mimetype='text/csv')


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
        run_per_partition = current_app.config['RUN_PER_PARTITION']
        # we need to set a customized train_path but without modifying the
        # global run_conf object, so we deepcopy the run_conf object

        upload_run_conf = copy.deepcopy(run_conf)
        upload_run_conf.train_path = abs_filepath

        enter_data(sql_conf, upload_run_conf, aws_conf, run_per_partition)

        return jsonify({'success': True})


# route to activate a single worker
@api.route('/simple_worker', methods=['GET'])
def dispatch_worker():
    """
    Executes the worker.py script inside a virtualenv and returns stdout and stderr
    as response.
    Note: It currently only works if rest_api_server.py file is in the same
    directory as the worker.py script.
    """

    def _start_worker(pipe_end, *args):
        stdout, stderr, _ = start_worker(*args)
        pipe_end.send({
            'stdout': stdout,
            'stderr': stderr
        })

    parent_end, child_end = Pipe()
    p = Process(target=_start_worker, args=(child_end,))

    p.start()
    received = parent_end.recv()
    p.join()

    return jsonify(received)
