import os
import sys
import argparse
from io import StringIO
from multiprocessing import Process

from flask import g

import atm
from atm.worker import work
from atm.database import Database
from atm.config import (add_arguments_aws_s3, add_arguments_sql,
                        add_arguments_logging,
                        load_config, initialize_logging)

from .error import ApiError
from .db import get_db


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
def work(*args):
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
    _args = parser.parse_args(args)

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


def dispatch_worker(datarun_id):
    db = get_db()
    datarun = db.get_datarun(datarun_id)
    if datarun is None:
        raise ApiError("No datarun found with the given id: %d" % datarun_id, 404)
    if datarun.status == atm.constants.RunStatus.PENDING:
        args = ['--dataruns', str(datarun_id)]
        p = Process(target=work, args=args)
        p.start()
        register_worker_process(p, datarun_id)
        # sleep for a while in case the return status is still running
        # time.sleep(0.001)


def stop_worker(datarun_id):
    p = get_worker_process(datarun_id)
    if p is None:
        return
    if p.is_alive():
        p.terminate()


def register_worker_process(process, datarun_id):
    if 'workers' not in g:
        g.workers = {}
    clean_dead_processes()
    if datarun_id in g.workers:
        raise ApiError("There should be only one process for one datarun!", 500)
    g.workers[datarun_id] = process


def clean_dead_processes():
    if 'workers' not in g:
        return
    g.workers = {datarun_id: p for datarun_id, p in g.workers.items() if p.is_alive()}


def get_worker_process(datarun_id):
    clean_dead_processes()
    if 'workers' not in g or datarun_id not in g.workers:
        return None
    return g.workers[datarun_id]
