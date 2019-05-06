import {createSelector} from 'reselect';
export const getClassifiersSummarySelector = (state: any) => state.DataRuns.toJS().classifiersSummary;
export const getClassifiersSelector = (state: any) => state.DataRuns.toJS().classifiers;
export const getHyperPartitionsSelector = (state: any) => state.DataRuns.toJS().hyperpartitions;

export const getIsLoading = (state: any) => state.DataRuns.toJS().isLoading;

export const filteredHyperPartitions = createSelector (
    [getHyperPartitionsSelector],
    (hyperPartition: any) => {
        return hyperPartition
    }
)