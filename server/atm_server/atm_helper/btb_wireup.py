"""
Helper functions that wire up the atm package
"""

from btb.selection import UCB1, Uniform, RecentKReward, BestKReward, PureBestKVelocity, HierarchicalByAlgorithm
import numpy as np

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
