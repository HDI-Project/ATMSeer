"""
Helper functions that wire up the atm package
"""

from atm.worker import Worker
from atm.constants import ClassifierStatus
from atm.utilities import get_public_ip
from btb.selection import UCB1, Uniform, RecentKReward, BestKReward, PureBestKVelocity, HierarchicalByAlgorithm
from collections import defaultdict
import numpy as np

from atm_server.db import get_db

K_MIN = 2


def _selector_scores2rewards(selector, choice_scores):
    reward_func = selector.compute_rewards
    if isinstance(selector, BestKReward) or isinstance(selector, RecentKReward):
        min_num_scores = min([len(s) for s in choice_scores.values()])
        if min_num_scores < K_MIN:
            reward_func = super(BestKReward, selector).compute_rewards
    elif isinstance(selector, PureBestKVelocity):
        min_num_scores = min([len(s) for s in choice_scores.values()])
        if min_num_scores < K_MIN:
            reward_func = super(BestKReward, selector).compute_rewards
        else:
            reward_func = lambda s: [1] if len(s) == min_num_scores else [0]
    elif isinstance(selector, HierarchicalByAlgorithm):
        raise NotImplementedError('No support for HierarchicalByAlgorithm currently')

    # convert the raw scores list for each choice to a "rewards" list

    choice_rewards = {}
    for choice, scores in choice_scores.items():
        # only consider choices that this object was initialized with
        if choice not in selector.choices:
            continue
        choice_rewards[choice] = reward_func(scores)
    return choice_rewards


def ucb_bandit_scores(choice_rewards):
    total_pulls = max(sum(len(r) for r in choice_rewards.values()), 1)

    scores = {}

    for choice, rewards in choice_rewards.items():
        # count the number of pulls for this choice, with a floor of 1
        choice_pulls = max(len(rewards), 1)

        # compute the 2-stdev error for the estimate of this choice
        error = np.sqrt(2.0 * np.log(total_pulls) / choice_pulls)

        # compute the average reward, or default to 0
        avg_reward = np.mean(rewards) if len(rewards) else 0

        # this choice's score is the upper bound of what we think is possible
        scores[choice] = avg_reward + error
    return scores


def selector_bandit_scores(selector, choice_scores):
    n_choices = len(choice_scores)
    if isinstance(selector, Uniform):
        return {choice: 1 / n_choices for choice in choice_scores.keys()}
    elif isinstance(selector, UCB1):
        choice_rewards = _selector_scores2rewards(selector, choice_scores)
        return ucb_bandit_scores(choice_rewards)
    else:
        raise NotImplementedError("No implementation for class %s" % str(type(selector)))


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
