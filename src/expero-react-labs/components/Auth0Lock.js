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
    console.log("DECODING STATE", state);
    return JSON.parse(state);
  }
  catch (e) {
    return {
      authState: "",
    };
  }
}

export function checkForRedirectAuthResult(clientId, domain, history) {
  const options = {
    auth: {
      redirect: true,
      responseType: 'token',
      autoParseHash: false,
    },
  };

  let result = {};

  if (history.location.hash) {
    console.log("CHECKING ", history.location.hash);
    const lock = new Lock(clientId, domain, options);
    lock.resumeAuth(history.location.hash, (error, authResult) => {
      if (error) {
        const {authState} = decodeState(error.state || "");
        result = {error, state: authState};
      }
      else if (authResult) {
        const state = decodeState(authResult.state);
        if (state.location) {
          history.replace(state.location);
        }

        const profile = authResult.idToken && jwtDecode(authResult.idToken);
        result = {
          profile,
          idToken: authResult.idToken,
          accessToken: authResult.accessToken,
          state: state.authState
        };
      }
    });
  }

  return result;
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
     * can process the result.  Usually http://localhost:3000/
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
     * redirect
     */
    history: PropTypes.object,

    className: PropTypes.string,
    /**
     * Called when the user has successfully logged in
     * Passed an object with these properties:
     *  idToken - the id token for the user
     *  accessToken - access token for the user
     *  profile - the user's profile (decoded from the idToken)
     *  state - state from the auth result (e.g. the state you originally passed in as auth.params.state
     * */
    onLogin: PropTypes.func.isRequired,
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
    ui: {},
    theme: {},
  };

  id = uniqueId("lock");

  render() {
    const {inline, className} = this.props;
    if (!inline) {
      return false;
    }

    return <div id={this.id} className={className}></div>;
  }

  componentDidMount() {
    // create the lock
    const { clientId, domain, ui, theme, inline, redirectMode, authScope, authState, redirectUrl, history } = this.props;
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
          state: encodeState(history, authState),
        }
      },
    };
    const lock = this._lock = new Lock(clientId, domain, options);

    // add event handlers
    lock.on("authenticated", this.onAuthenticated);
    lock.on("unrecoverable_error", this.onUnrecoverableError);
    lock.on("authorization_error", this.onAuthorizationError);
    lock.on("federated login", this.onFederatedLogin);

    console.log("CONSTRUCTOR LOCK", window.location.href);

    // wait for React to finish rendering then show the lock
    setTimeout(this.showLock, 0);
  }

  componentWillUnmount() {
    this._lock = null;
  }

  showLock = () => {
    console.log("SHOWING LOCK", window.location.href);
    this._lock && this._lock.show();
  }

  onAuthenticated = ({idToken, accessToken, state}) => {
    const profile = idToken && jwtDecode(idToken);
    this.props.onLogin({idToken, accessToken, profile, state});
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

  onFederatedLogin = () => {
    if (this.props.redirectMode) {
      console.log("leaving page");
    }
  };
}
