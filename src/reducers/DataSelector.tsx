import * as Immutable from 'immutable';

const initialState = Immutable.Map({
    datarunID: null,
    datasetID: null,
    dataSet: Immutable.List(),
    isDataSetLoading: false,
    datarunStatus: ''
});


export default function DataSelector(state = initialState, action: any) {
    switch(action.type){
        case 'SET_DATASET_REQUEST':
            return state
                .set('isDataSetLoading', true)
                .set('dataSet', Immutable.List())

        case 'SET_DATASET_SUCCESS':
            return state
                .set('dataSet', action.dataSet)
                .set('isDataSetLoading', false);
        case 'SET_DATASET_ERROR':
            return state
                .set('data', Immutable.List())
                .set('isDataSetLoading', false);

        case 'SET_DATARUNID_SUCCESS':
            return state
                .set('datarunID', action.datarunID)

        case 'SET_DATASET_ID_SUCCESS':
            return state
                .set('datasetID', action.datasetID)

        case 'UPDATE_DATARUN_STATUS':
            return state
                .set('datarunStatus', action.datarunStatus);

        case 'START_DATARUN_SUCCESS':
        case 'STOP_DATARUN_SUCCESS':
            return state
                .set('datarunStatus', action.datarunStatus);

        default:
            return state;

    }
}