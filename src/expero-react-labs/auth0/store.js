import {processAuthRedirectResult} from './Auth0Lock';

/** name of this redux module */
export const MODULE = "auth0";

export function getAuth0 (state) { return state[MODULE]; }
export function getIsAuthenticated (state) { return !!getAuth0(state).idToken; }

// ------------------------------------
// Constants
// ------------------------------------
function actionPrefix (type) { return `${MODULE}/${type}`; }

export const SET_CLIENT_DETAILS = actionPrefix("SET_CLIENT_DETAILS");
export const LOGIN = actionPrefix("LOGIN");
export const LOGIN_ERROR = actionPrefix("LOGIN_ERROR");
export const LOGOUT = actionPrefix("LOGOUT");

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
      return dispatch(loginError(authResult.error));
    }

    if (authResult.idToken) {
      return dispatch(login(authResult));
    }
  };
}

export function initializeAuth(clientId, domain, history) {
  return async (dispatch) => {
    dispatch(setClientDetails(clientId, domain));
    const authResult = await processAuthRedirectResult(clientId, domain, history);
    dispatch(handleAuthRedirectResult(authResult));
    return authResult;
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
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  // wipes out existing login results
  [SET_CLIENT_DETAILS]: (state, {payload}) => payload,
  [LOGIN]: ({clientId, domain}, {payload}) => ({clientId, domain, ...payload}),
  [LOGOUT]: ({clientId, domain}) => ({clientId, domain}),
  [LOGIN_ERROR]: ({clientId, domain}, {payload}) => ({clientId, domain, ...payload}),
};

// ------------------------------------
// Reducer
// ------------------------------------
export function reducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[ action.type ];

  return handler ? handler(state, action) : state;
}

export default { [MODULE]: reducer };
