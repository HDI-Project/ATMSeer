import { createSelector } from "reselect";

export const getDatarunIdSelector = (state: any) => state.DataSelector.toJS().datarunID;
export const getDatasetIdSelector = (state: any) => state.DataSelector.toJS().datasetID;
export const getDatarunStatusSelector = (state: any) => state.DataSelector.toJS().datarunStatus;
export const getDataSetSelector = (state: any) => state.DataSelector.toJS().dataSet;
export const getIsDataSetLoading = (state: any) => state.DataSelector.toJS().isDataSetLoading;
export const getDataRunsSelector = (state: any) => {
    debugger;
    return state.DataSelector.toJS().getDataRuns;
}


export const someOptions = createSelector(
    [getDataRunsSelector, getDatarunIdSelector, getDatasetIdSelector],
    (dataruns, dataRunID, dataSetID) => {
        console.log(dataruns, dataRunID, dataSetID)
    }
)