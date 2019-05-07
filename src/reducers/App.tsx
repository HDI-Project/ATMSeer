import * as Immutable from 'immutable';

const initialState = Immutable.Map({
    datarunID: null,
    datasetID: null,
    datarunStatus: ''
});

export default function App(state = initialState, action: any) : any {
    switch(action.type) {
        case 'SET_DATARUNID_SUCCESS':
            return state
                .set('datarunID', action.datarunID)

        case 'SET_DATASET_ID_SUCCESS':
            return state
                .set('datasetID', action.datasetID)

        case 'UPDATE_DATARUN_STATUS_SUCCESS':{
            return state
                .set('datarunStatus', action.datarunStatus);
        }

        default:
            return state;
    }
}