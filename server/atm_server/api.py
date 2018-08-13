import os
import copy
import logging


from multiprocessing import Process
from flask import request, jsonify, Blueprint, current_app, Response
from werkzeug.utils import secure_filename
from sqlalchemy.exc import InvalidRequestError

from atm.enter_data import enter_data
from atm.constants import ClassifierStatus

from .utils import flaskJSONEnCoder
from .error import ApiError
from .db import fetch_entity, summarize_classifiers, fetch_dataset_path, get_db, summarize_datarun, \
    fetch_classifiers, fetch_hyperpartitions
from .worker import start_worker, stop_worker, work
from atm_server.helper.atm_helper import get_datarun_steps_info
from atm_server import SERVER_ROOT
from atm.config import load_config
import yaml
import json

api = Blueprint('api', __name__)

logger = logging.getLogger('atm_vis')


def allowed_file(filename):
    """
    Checks if filename ends with an allowed file extension.
    See: http://flask.pocoo.org/docs/0.12/patterns/fileuploads/
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@api.errorhandler(ApiError)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@api.errorhandler(InvalidRequestError)
def handle_db_request_error(error):
    logging.exception(error)
    response = jsonify({"error":str(error)})
    response.status_code = 500
    return response


# inject a more powerful jsonEncoder
api.json_encoder = flaskJSONEnCoder


# Wrap the return as a json response
def fetch_entity_as_json(*args, **kwargs):
    return jsonify(fetch_entity(*args, **kwargs))


# def read_file_in_chunks(file_path, chunk_size):


######################
# API Starts here
######################


@api.route('/datasets', methods=['GET'])
def get_datasets():
    """Fetch the info of all datasets"""
    return fetch_entity_as_json('Dataset')


@api.route('/datasets/<int:dataset_id>', methods=['GET'])
def get_dataset(dataset_id):
    """Fetch the info of a dataset by id"""
    return fetch_entity_as_json('Dataset', {'id': dataset_id}, True)


@api.route('/dataset_file/<int:dataset_id>', methods=['GET'])
def get_dataset_file(dataset_id):
    """Fetch the dataset file by id"""
    train = request.args.get('train', True, type=bool)
    dataset_path = fetch_dataset_path(dataset_id, train)

    def read_in_chunks(chunk_size=1024):
        f = open(dataset_path, 'r')
        while True:
            data = f.read(chunk_size)
            if not data:
                break
            yield data
        f.close()
    return Response(read_in_chunks(), mimetype='text/csv')


@api.route('/dataruns', methods=['GET'])
def get_dataruns():
    """
    Fetch the info of dataruns. A query parameter of dataset_id is supported.
    E.g.: /api/dataruns?dataset_id=1
    """
    dataset_id = request.args.get('dataset_id', None, type=int)
    return fetch_entity_as_json('Datarun', {'dataset_id': dataset_id})


@api.route('/dataruns/<int:datarun_id>', methods=['GET'])
def get_datarun(datarun_id):
    """Fetch the summary of a datarun by id"""
    return fetch_entity_as_json('Datarun', {'id': datarun_id}, True)


@api.route('/datarun_summary/<int:datarun_id>', methods=['GET'])
def get_datarun_summary(datarun_id):
    """Fetch the summary of a datarun by id"""
    classifier_start = request.args.get('classifier_start', None, type=int)
    classifier_end = request.args.get('classifier_end', None, type=int)
    return jsonify(summarize_datarun(datarun_id, classifier_start, classifier_end))


@api.route('/hyperpartitions', methods=['GET'])
def get_hyperpartitions():
    """
    Fetch the info of hyperpartitions.
    E.g.: /api/hyperpartitions?dataset_id=1&datarun_id=1
    """
    dataset_id = request.args.get('dataset_id', None, type=int)
    datarun_id = request.args.get('datarun_id', None, type=int)
    nice = request.args.get('nice', True, type=bool)
    return jsonify(fetch_hyperpartitions(dataset_id=dataset_id, datarun_id=datarun_id, nice=nice))


@api.route('/hyperpartitions/<int:hyperpartition_id>', methods=['GET'])
def get_hyperpartition(hyperpartition_id):
    """Fetch the info of a hyperpartition by id"""
    nice = request.args.get('nice', True, type=bool)
    return jsonify(fetch_hyperpartitions(hyperpartition_id, nice=nice)[0])


@api.route('/classifiers', methods=['GET'])
def get_classifiers():
    """
    Fetch the info of classifiers.
    E.g.: /api/classifiers?datarun_id=1&hyperpartition_id=1
    """
    datarun_id = request.args.get('datarun_id', None, type=int)
    hyperpartition_id = request.args.get('hyperpartition_id', None, type=int)
    status = request.args.get('status', ClassifierStatus.COMPLETE, type=str)
    # sort_by_score = request.args.get('sort_by_score', False, type=bool)
    nice = request.args.get('nice', True, type=bool)
    return jsonify(fetch_classifiers(datarun_id=datarun_id, hyperpartition_id=hyperpartition_id,
                                     status=status, nice=nice))

    # return fetch_entity_as_json('Classifier', {'datarun_id': datarun_id,
    #                                            'hyperpartition_id': hyperpartition_id})


@api.route('/classifiers/<int:classifier_id>', methods=['GET'])
def get_classifier(classifier_id):
    """Fetch the info of a classifier by id"""
    nice = request.args.get('nice', True, type=bool)
    return jsonify(fetch_classifiers(classifier_id, nice=nice)[0])
    # return fetch_entity_as_json('Classifier', {'id': classifier_id}, True)


@api.route('/classifier_summary', methods=['GET'])
def get_classifier_summary():
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


@api.route('/datarun_steps_scores/<int:datarun_id>', methods=['GET'])
def get_datarun_steps_scores(datarun_id):
    """
        Get the scores of the hyperpartitions/method in each step.
        Query arameters:
            classifier_start: only return the scores of and after the `classifier_start` th classifier
            classifier_end: only return the scores before the `classifier_end` th classifier,
                Note that :classifier_start and :classifier_end are not ids, they starts from 1.
                (This is because the caller may not know the classifier ids of the datarun)
            nice: A flag for return nice format result
    :param datarun_id: the id of the datarun
    :return:
        if nice is False,
        [
            {"1": 0.2, "2": 0.3, ...},
            ...
        ]
        if nice is True,
        [
            {
                "knn": [0.2, 0.3],
                "logreg": [0.1],
                ...
            },
            ...
        ]
    """
    classifier_start = request.args.get('classifier_start', None, type=int)
    classifier_end = request.args.get('classifier_end', None, type=int)
    nice = request.args.get('nice', 0, type=int)
    scores_of_steps = get_datarun_steps_info(datarun_id, classifier_start, classifier_end, nice)
    return jsonify(scores_of_steps)


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

        if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
            os.makedirs(current_app.config['UPLOAD_FOLDER'])
        if os.path.exists(abs_filepath):
            file_name, file_extension = os.path.splitext(abs_filepath)
            path_temp = file_name + '_%d' + file_extension
            count = 2
            while os.path.exists(abs_filepath):
                abs_filepath = path_temp % count
                count += 1
                # Ugly hack to prevent dead loop
                if count > 100:
                    raise ValueError('The saved data file renamed to over 100, please rename the file and upload.')
            logger.warning('Filename %s already exists, renamed and saved to %s' % (rel_filepath, abs_filepath))

        file.save(abs_filepath)

        run_conf = current_app.config['RUN_CONF']
        sql_conf = current_app.config['SQL_CONF']
        aws_conf = current_app.config['AWS_CONF']
        run_per_partition = current_app.config['RUN_PER_PARTITION']
        # we need to set a customized train_path but without modifying the
        # global run_conf object, so we deepcopy the run_conf object

        upload_run_conf = copy.deepcopy(run_conf)
        upload_run_conf.train_path = abs_filepath

        datarun_id = enter_data(sql_conf, upload_run_conf, aws_conf, run_per_partition)

        return jsonify({'success': True, 'filename': os.path.split(abs_filepath)[1], 'id': datarun_id})


@api.route('/simple_worker', methods=['GET', 'POST'])
def dispatch_simple_worker():
    """
    Executes the worker.py script inside a virtualenv and returns stdout and stderr
    as response.
    Note: It currently only works if rest_api_server.py file is in the same
    directory as the worker.py script.
    """

    # parent_end, child_end = Pipe()
    p = Process(target=work)

    p.start()
    return jsonify({'submitted': True})
    # if block:
    #     received = parent_end.recv()
    #     p.join()
    #
    #     return jsonify(received)


# route to activate a single worker
@api.route('/start_worker/<int:datarun_id>', methods=['GET', 'POST'])
def dispatch_single_worker(datarun_id):
    """
    Dispatch a worker for a datarun (if the datarun is not complete or already running)
    Return the current status of the datarun
    """
    start_worker(datarun_id)
    db = get_db()
    datarun = db.get_datarun(datarun_id)
    return jsonify({'status': datarun.status})


# route to activate a single worker
@api.route('/stop_worker/<int:datarun_id>', methods=['GET', 'POST'])
def stop_single_worker(datarun_id):
    """
    Stop a worker by the given datarun_id (or do nothing if no worker found for the datarun)
    Return the status of the datarun
    """
    db = get_db()
    stop = stop_worker(datarun_id)
    datarun = db.get_datarun(datarun_id)
    return jsonify({'status': datarun.status, 'success': stop})


@api.route('/configs', methods=['GET','POST'])
def configs_info():
    """Fetch or set the info of run configs"""
    result = {}
    result['success']=False
    run_path = current_app.config['run_config']
    if request.method == 'GET':
        with open(run_path) as f:
            run_args = yaml.load(f)
            result.update(run_args)
            result.update({'success':True})
    elif request.method == 'POST':
        # Get local set configs
        run_args = {}
        with open(run_path) as f:
            run_args = yaml.load(f)
        # Update Local set configs And Save in the default file.
        configs = json.loads(request.form['configs'])
        run_args.update(configs)
        with open(run_path,'w') as f:
            yaml.dump(run_args,f)
        # Load Config Again. And Update Current APP Configs.
        config = {'run_config':run_path}
        # Load ATM confs
        _, run_conf, _, _ = load_config(**config)
        current_app.config.update({'RUN_CONF': run_conf})
        result['success']=True
    return jsonify(result)
