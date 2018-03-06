import React from 'react';
import PropTypes from 'prop-types';
import Lock from 'auth0-lock';
import uniqueId from 'lodash/uniqueId';
import jwtDecode from 'jwt-decode';

function encodeState(history, authState) {
  const s = {
    location: history && {pathname: history.location.pathname, search: history.location.search},
    authState,
  };

  return JSON.stringify(s);
}

function decodeState(state) {
  try {
    return JSON.parse(state);
  }
  catch (e) {
    return {
      authState: "",
    };
  }
}

/**
 * Checks the URL hash for the results of a redirect-based authentication.
 * If authentication results are available, then it does the following:
 *   - decodes the authentication results
 *   - changes the URL back to the URL captured at the start of the authentication operation
 *   - resolves the promise with the results of the authentication
 * If the authentication was successful, the promise will resolve to an object with these properties:
 *  - idToken - the id token for the user
 *  - accessToken - access token for the user
 *  - profile - the user's profile (decoded from the idToken)
 *  - state - state from the auth result (e.g. the state you originally passed in as auth.params.state.  You can
 *     use this object to rehydrate application state that you saved before the authentication redirect
 * If authentication failed, then the promise resolves to an object with these properties:
 *  - error - the details of the authentication error.  Pass this as the "error" prop to Auth0Lock to display the error
 *  to the user
 *  - state - state from the auth result (e.g. the state you originally passed in as auth.params.state.  You can
 *     use this object to rehydrate application state that you saved before the authentication redirect
 * @param clientId
 * @param domain
 * @param history
 * @returns {Promise}
 */
export function processAuthRedirectResult(clientId, domain, history) {
  return new Promise((resolve) => {
    try {
      const options = {
        auth: {
          redirect: true,
          responseType: 'token',
          autoParseHash: false,
        },
      };

      if (history && history.location.hash) {
        // clientid and domain isn't needed for this call to decode the auth token from the hash
        const lock = new Lock(clientId, domain, options);
        lock.resumeAuth(history.location.hash, (error, authResult) => {
          try {
            if (error) {
              const { authState, location } = decodeState(error.state || "");
              if (location) {
                history.replace(location);
              }

              resolve({ error, state: authState });
            }
            else if (authResult) {
              const state = decodeState(authResult.state);
              if (state.location) {
                history.replace(state.location);
              }

              const profile = authResult.idToken && jwtDecode(authResult.idToken);
              resolve({
                profile,
                idToken: authResult.idToken,
                accessToken: authResult.accessToken,
                state: state.authState
              });
            }
          }
          catch (e) {
            resolve({error: e, state: ""});
          }
        });
      }
      else {
        resolve({});
      }
    }
    catch (e) {
      resolve({error: e, state: ""});
    }
  });
}

export default class Auth0Lock extends React.Component {
  static propTypes = {
    clientId: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    /** See https://github.com/auth0/lock#ui-options */
    ui: PropTypes.object,
    /** See https://github.com/auth0/lock#theming-options */
    theme: PropTypes.object,
    /** true to render the lock inline.  false to render it in a modal dialog */
    inline: PropTypes.bool,
    /** Use redirect mode instead of popup to login to social provider
     * (redirect mode will navigate user to social provider website and then back to this website)
     */
    redirectMode: PropTypes.bool,
    /**
     * In redirect mode, where should auth0 send the user after authentication so that your app
     * can process the result.  Usually http://localhost:3000/.  Defaults to the server
     * URL that served this page
     */
    redirectUrl: PropTypes.string,
    /**
     * See https://auth0.com/docs/scopes/current
     * See https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
     */
    authScope: PropTypes.string,
    /**
     * Will be passed back as "state" in onLogin callback
     * Most useful to rehydrate app state when using redirectMode
     */
    authState: PropTypes.string,
    /**
     * If in redirect mode, supply history object so that the lock
     * can capture the current route information and restore it after
     * redirect.  If not supplied, then the lock will not redirect the user after authentication
     * (e.g. you should do it yourself in onAuthenticated)
     */
    history: PropTypes.object,
    /**
     * If supplied, then will be shown to the user.  Primarily useful if you are using Redirect Mode.
     * Capture the error from your call to processAuthRedirectResult and pass it back through to the Lock
     */
    error: PropTypes.object,

    /**
     * When inline = true, optional class to add to the containing div element
     */
    className: PropTypes.string,
    /**
     * When inline = true, optional style to add to the containing div element
     */
    style: PropTypes.object,
    /**
     * Called when the user has successfully logged in
     * Passed an object with these properties:
     *  idToken - the id token for the user
     *  accessToken - access token for the user
     *  profile - the user's profile (decoded from the idToken)
     *  state - state from the auth result (e.g. the state you originally passed in as auth.params.state
     * */
    onLogin: PropTypes.func,
    /** called when the user fails to login */
    onAuthorizationError: PropTypes.func,
    /** called when there is an unknown login error */
    onUnrecoverableError: PropTypes.func,
  };

  static defaultProps = {
    inline: false,
    redirectMode: false,
    authScope: 'openid profile email',
    authState: 'nostateprovided',
    className: "",
    redirectUrl: `${window.location.protocol}//${window.location.host}/`,
    ui: {},
    theme: {},
  };

  id = uniqueId("lock");

  render() {
    const {inline, className, style} = this.props;
    if (!inline) {
      return false;
    }

    return <div id={this.id} className={className} style={style}></div>;
  }

  componentDidMount() {
    // create the lock
    const {clientId, domain, ui, theme, inline, redirectMode, authScope, authState, redirectUrl, history} = this.props;
    const options = {
      autofocus: true,
      autoclose: false,
      ...ui,
      container: inline ? this.id : undefined,
      theme,
      auth: {
        redirect: !!redirectMode,
        redirectUrl,
        responseType: 'token',
        autoParseHash: true,
        params: {
          scope: authScope,
          state: redirectMode ? encodeState(history, authState) : authState,
        }
      },
    };
    const lock = this._lock = new Lock(clientId, domain, options);

    // add event handlers
    lock.on("authenticated", this.onAuthenticated);
    lock.on("unrecoverable_error", this.onUnrecoverableError);
    lock.on("authorization_error", this.onAuthorizationError);

    // wait for React to finish rendering then show the lock
    setTimeout(this.showLock, 0);
  }

  componentWillUnmount() {
    if (this._lock) {
      this._lock.hide();
      this._lock = null;
    }
  }

  showLock = () => {
    if (this._lock) {
      // Add the error message to the lock
      let flashMessage;
      const {error} = this.props;
      if (error) {
        const msg = error.error_description || error.message || error.error;
        if (typeof msg === "string") {
          flashMessage = {
            type: "error",
            text: msg
          };
        }
      }

      this._lock.show({flashMessage});
    }
  }

  onAuthenticated = ({idToken, accessToken, state}) => {
    if (this.props.onLogin) {
      const authState = this.props.redirectMode ? decodeState(state).authState : state;
      const profile = idToken && jwtDecode(idToken);
      this.props.onLogin({ idToken, accessToken, profile, state: authState });
    }
  };

  onUnrecoverableError = (error) => {
    if (this.props.onUnrecoverableError) {
      this.props.onUnrecoverableError(error);
    }
  }

  onAuthorizationError = (error) => {
    if (this.props.onAuthorizationError) {
      this.props.onAuthorizationError(error);
    }
  };
}
