import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

/** name of this redux module */
const MODULE = "wellExplorer";

export function getWellExplorer(state) {
  return state[MODULE];
}

// ------------------------------------
// Constants
// ------------------------------------
function actionPrefix(type) {
  return `${MODULE}/${type}`;
}

export const CHANGE_WELL_ACCESS_TIMESTAMP = actionPrefix("CHANGE_WELL_ACCESS_TIMESTAMP");

// ------------------------------------
// Actions
// ------------------------------------

export function changeWellAccessTimestamp(wellId) {
  return {
    type: CHANGE_WELL_ACCESS_TIMESTAMP,
    payload: { wellId }
  };
}

export const actions = {
  changeWellAccessTimestamp
};

// ------------------------------------
// Action Handlers
// ------------------------------------

const ACTION_HANDLERS = {
  [CHANGE_WELL_ACCESS_TIMESTAMP]: (state, action) => {
    return {
      ...state,
      wellTimestamps: {
        ...state.wellTimestamps,
        [action.payload.wellId]: new Date().getTime()
      }
    };
  }
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  wellTimestamps: {}
};

const persistConfig = {
  key: "wellExplorer",
  storage,
  whitelist: ["wellTimestamps"]
};

const reducer = persistReducer(persistConfig, (state = initialState, action) => {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
});

export default {
  key: MODULE,
  reducer
};
