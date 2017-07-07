import {processAuthRedirectResult} from './Auth0Lock';

/** name of this redux module */
export const MODULE = "auth0";

export function getAuth0 (state) {
  const auth0 = state[MODULE];

  if (__DEV__) {
    if (!auth0) {
      throw new Error("Did you forget to add the reducer from auth0/store to your store?");
    }
  }

  return auth0;
}

export function getIsAuthenticated (state) { return !!getAuth0(state).idToken; }

// ------------------------------------
// Constants
// ------------------------------------
function actionPrefix (type) { return `${MODULE}/${type}`; }

export const SET_CLIENT_DETAILS = actionPrefix("SET_CLIENT_DETAILS");
export const LOGIN = actionPrefix("LOGIN");
export const LOGIN_ERROR = actionPrefix("LOGIN_ERROR");
export const LOGOUT = actionPrefix("LOGOUT");
export const INITIALIZING = actionPrefix("INITIALIZING");
export const INITIALIZED = actionPrefix("INITIALIZED");

// ------------------------------------
// Actions
// ------------------------------------
export function setClientDetails(clientId, domain) {
  return {
    type: SET_CLIENT_DETAILS,
    payload: {clientId, domain}
  };
}

export function login({profile, idToken, accessToken}) {
  return {
    type: LOGIN,
    payload: {profile, idToken, accessToken},
  };
}

export function logout() {
  return {type: LOGOUT};
}

export function loginError(error) {
  return {
    type: LOGIN_ERROR,
    payload: {error},
  };
}

export function handleAuthRedirectResult(authResult) {
  return (dispatch) => {
    if (authResult.error) {
      dispatch(loginError(authResult.error));
    }
    else if (authResult.idToken) {
      dispatch(login(authResult));
    }
  };
}

export function initializeAuth(clientId, domain, history) {
  return (dispatch) => {
    dispatch({type: INITIALIZING});
    dispatch(setClientDetails(clientId, domain));
    return processAuthRedirectResult(clientId, domain, history).then(authResult => {
      dispatch(handleAuthRedirectResult(authResult));
      dispatch({type: INITIALIZED});
      return authResult;
    });
  };
}

export const actions = {
  setClientDetails, login, loginError, logout,
};

const initialState = {
  clientId: undefined,
  domain: undefined,

  // after successful login
  idToken: undefined,
  profile: undefined,
  accessToken: undefined,

  // after failed login
  error: undefined,

  // "initializing" then "initialized"
  status: "uninitialized",
};

export const connectOptions = {
  pure: true,
  areStatesEqual: (next, prev) => getAuth0(next) === getAuth0(prev),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  // wipes out existing login results
  [SET_CLIENT_DETAILS]: ({status}, {payload}) => ({status, ...payload}),
  [LOGIN]: ({clientId, domain, status}, {payload}) => ({clientId, domain, status, ...payload}),
  [LOGOUT]: ({clientId, domain, status}) => ({clientId, domain, status}),
  [LOGIN_ERROR]: ({clientId, domain, status}, {payload}) => ({clientId, domain, status, ...payload}),
  [INITIALIZING]: state => ({...state, status: "initializing"}),
  [INITIALIZED]: state => ({...state, status: "initialized"}),
};

// ------------------------------------
// Reducer
// ------------------------------------
export function reducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[ action.type ];

  return handler ? handler(state, action) : state;
}

export default { [MODULE]: reducer };
