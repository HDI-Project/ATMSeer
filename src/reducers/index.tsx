import {combineReducers} from 'redux';
import DataRuns from './DataRuns';
// import App from './App';
import DataSelector from './DataSelector'

const rootReducer: any = combineReducers({
    // App,
    DataRuns,
    DataSelector
});

export default rootReducer;