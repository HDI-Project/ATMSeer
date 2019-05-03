import {createStore, applyMiddleware} from 'redux';
import reducers from './../src/reducers/index';
import thunkMiddleWare from 'redux-thunk';
import {createLogger} from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import apiMiddleWare from 'middlewares/api';

const loggerMiddleware: any = createLogger({
   collapsed: true
});

const initialState = {};

const middlewares: any = [thunkMiddleWare, loggerMiddleware, apiMiddleWare]
// const store = createStore(reducers, applyMiddleware({...middleware}));

const store: any = createStore(reducers, initialState, composeWithDevTools(
  applyMiddleware(...middlewares),
));

export default store;