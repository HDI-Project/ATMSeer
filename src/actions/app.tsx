export function setDatarunIdAction(datarunID: any) {
    return function(dispatch: any) {
        return dispatch({
            type: 'SET_DATARUNID_SUCCESS',
            datarunID
        })
    }
}


export function setDataSetIdAction(datasetID: any) {
    return function(dispatch: any) {
        return dispatch({
            type: 'SET_DATASET_ID_SUCCESS',
            datasetID
        })
    }
}

export function setDatarunStatusAction(datarunStatus: any) {
    return function(dispatch: any) {
        return dispatch({
            type: 'UPDATE_DATARUN_STATUS_SUCCESS',
            datarunStatus
        })
    }
}