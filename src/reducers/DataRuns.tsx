import * as Immutable from 'immutable';

const initialState: any = Immutable.Map({
    classifiers: Immutable.Map(),
    isLoading: false
});

export default function DataRuns(state = initialState, action: any): any {
    switch(action.type) {
        case 'GET_CLASSIFIERS_REQUEST':
            return state.set('isLoading', true);
        case 'GET_CLASSIFIERS_SUCCESS':
            return state
                .set('classifiers', action.classifiers)
                .set('isLoading', false);
        case 'GET_CLASSIFIERS_ERROR':
            return state
                .set('isLoading', false)
                .set('classifiers', Immutable.Map())
        default:
            return state
    }
}
