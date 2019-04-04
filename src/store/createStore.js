import { applyMiddleware, compose, createStore as createReduxStore } from "redux";
import thunk from "redux-thunk";
import makeRootReducer from "./reducers";
import { updateLocation } from "./location";

const createStore = (initialState, history) => {
  const iState = initialState || { location: history.location };

  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk];

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = [];
  let composeEnhancers = compose;

  if (__DEV__) {
    if (typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === "function") {
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createReduxStore(
    makeRootReducer(),
    iState,
    composeEnhancers(applyMiddleware(...middleware), ...enhancers)
  );
  store.asyncReducers = {};

  // To unsubscribe, invoke `store.unsubscribeHistory()` anytime
  store.unsubscribeHistory = history.listen(updateLocation(store));

  /*
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default;
      store.replaceReducer(reducers(store.asyncReducers));
    });
  }
  */

  return store;
};

export default createStore;
