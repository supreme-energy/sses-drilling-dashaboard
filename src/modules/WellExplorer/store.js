import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// tabs
export const FAVORITES = "FAVORITES";
export const ALL_WELLS = "ALL WELLS";
export const RECENT_WELLS = "RECENT WELLS";

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
export const CHANGE_ACTIVE_TAB = actionPrefix("CHANGE_ACTIVE_TAB");
export const CHANGE_SELECTED_WELL = actionPrefix("CHANGE_SELECTED_WELL");

// ------------------------------------
// Actions
// ------------------------------------

export function changeWellAccessTimestamp(wellId) {
  return {
    type: CHANGE_WELL_ACCESS_TIMESTAMP,
    payload: { wellId }
  };
}

export function changeActiveTab(tab) {
  return {
    type: CHANGE_ACTIVE_TAB,
    payload: { tab }
  };
}

export function changeSelectedWell(wellId) {
  return {
    type: CHANGE_SELECTED_WELL,
    payload: wellId
  };
}

export const actions = {
  changeWellAccessTimestamp,
  changeActiveTab,
  changeSelectedWell
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
        [action.payload.wellId]: Date.now()
      }
    };
  },
  [CHANGE_ACTIVE_TAB]: (state, action) => {
    return {
      ...state,
      activeTab: action.payload.tab
    };
  },
  [CHANGE_SELECTED_WELL]: (state, action) => {
    return {
      ...state,
      selectedWellId: action.payload
    };
  }
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  wellTimestamps: {},
  activeTab: ALL_WELLS,
  selectedWellId: null
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
