import {combineReducers} from 'redux';
import DataRuns from './DataRuns';
import App from './App';

const rootReducer: any = combineReducers({
    DataRuns,
    App
});

export default rootReducer;