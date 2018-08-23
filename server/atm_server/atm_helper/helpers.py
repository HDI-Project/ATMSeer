from collections import defaultdict
import logging

import numpy as np
from atm.worker import Worker
from atm.constants import ClassifierStatus, PartitionStatus
from atm.utilities import get_public_ip
from atm.enter_data import create_dataset, create_datarun
from atm.method import Method

from atm_server.db import get_db
from .btb_wireup import selector_bandit_scores


logger = logging.getLogger('atm-vis')


def get_datarun_steps_info(datarun_id, classifier_start=None, classifier_end=None, nice=False):
    """
    Get the scores of the hyperpartitions/method in each step.
    :param datarun_id: the id of the datarun
    :param classifier_start: only return the scores of and after the `classifier_start` th classifier
    :param classifier_end: only return the scores before the `classifier_end` th classifier,
        Note that :classifier_start and :classifier_end are not ids, they starts from 1.
        (This is because the caller may not know the classifier ids of the datarun)
    :param nice: A flag for return nice format result
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
    if classifier_start is None:
        classifier_start = -np.inf
    if classifier_end is None:
        classifier_end = np.inf
    db = get_db()

    datarun = db.get_datarun(datarun_id=datarun_id)
    hyperpartitions = db.get_hyperpartitions(datarun_id=datarun_id)

    # load classifiers and build scores lists
    # make sure all hyperpartitions are present in the dict, even ones that
    # don't have any classifiers. That way the selector can choose hyperpartitions
    # that haven't been scored yet.
    hyperpartition_scores = {fs.id: [] for fs in hyperpartitions}
    classifiers = db.get_classifiers(datarun_id=datarun_id, status=ClassifierStatus.COMPLETE)
    selected_classifiers = [c for c in classifiers if c.hyperpartition_id in hyperpartition_scores]
    # Create a temporary worker
    worker = Worker(db, datarun, public_ip=get_public_ip())
    bandit_scores_of_steps = []
    for i, c in enumerate(selected_classifiers):
        if i >= classifier_end:
            break
        # the cast to float is necessary because the score is a Decimal;
        # doing Decimal-float arithmetic throws errors later on.
        score = float(getattr(c, datarun.score_target) or 0)
        hyperpartition_scores[c.hyperpartition_id].append(score)
        bandit_scores = selector_bandit_scores(worker.selector, hyperpartition_scores)
        bandit_scores = {key: float("%.5f" % val) for key, val in bandit_scores.items()}
        if i < classifier_start:
            continue
        bandit_scores_of_steps.append(bandit_scores)
    # For a nicer formatted output
    if nice:
        results = []
        hp_id2method = {fs.id: fs.method for fs in hyperpartitions}
        for bandit_scores in bandit_scores_of_steps:
            res = defaultdict(list)
            for hp_id, score in bandit_scores.items():
                res[hp_id2method[hp_id]].append(score)
            results.append(res)
        return results

    return bandit_scores_of_steps


def new_datarun(db, run_config, run_per_partition=False):
    """
    A modification of the atm.enter_data.enter_data
    Generate a datarun, including a dataset if necessary.

    db: an instance of atm.Database.
    run_config: all attributes necessary to initialize a Datarun, including
        Dataset info if the dataset has not already been created.

    Returns: ID of the generated datarun
    """
    # connect to the database

    # if the user has provided a dataset id, use that. Otherwise, create a new
    # dataset based on the arguments we were passed.
    # if run_config.dataset_id is None:
    #     raise ValueError('')
    #     # dataset = create_dataset(db, run_config, aws_config=aws_config)
    #     # run_config.dataset_id = dataset.id
    # else:
    dataset = db.get_dataset(run_config.dataset_id)

    method_parts = {}
    for m in run_config.methods:
        # enumerate all combinations of categorical variables for this method
        method = Method(m)
        method_parts[m] = method.get_hyperpartitions()
        logger.info('method %s has %d hyperpartitions' %
                    (m, len(method_parts[m])))

    # create hyperpartitions and datarun(s)
    run_ids = []
    if not run_per_partition:
        logger.debug('saving datarun...')
        datarun = create_datarun(db, dataset, run_config)

    logger.debug('saving hyperpartions...')
    for method, parts in list(method_parts.items()):
        for part in parts:
            # if necessary, create a new datarun for each hyperpartition.
            # This setting is useful for debugging.
            if run_per_partition:
                datarun = create_datarun(db, dataset, run_config)
                run_ids.append(datarun.id)

            # create a new hyperpartition in the database
            db.create_hyperpartition(datarun_id=datarun.id,
                                     method=method,
                                     tunables=part.tunables,
                                     constants=part.constants,
                                     categoricals=part.categoricals,
                                     status=PartitionStatus.INCOMPLETE)

    logger.info('Data entry complete. Summary:')
    logger.info('\tDataset ID: %d' % dataset.id)
    logger.info('\tTraining data: %s' % dataset.train_path)
    logger.info('\tTest data: %s' % (dataset.test_path or 'None'))
    if run_per_partition:
        logger.info('\tDatarun IDs: %s' % ', '.join(map(str, run_ids)))
    else:
        logger.info('\tDatarun ID: %d' % datarun.id)
    logger.info('\tHyperpartition selection strategy: %s' % datarun.selector)
    logger.info('\tParameter tuning strategy: %s' % datarun.tuner)
    logger.info('\tBudget: %d (%s)' % (datarun.budget, datarun.budget_type))

    return run_ids or datarun.id
