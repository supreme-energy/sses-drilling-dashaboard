import { combineReducers } from 'redux';
import locationReducer from './location';
import auth0 from 'react-powertools/auth0/store';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    ...auth0,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
