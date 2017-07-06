import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {loginError, login, getAuth0, getIsAuthenticated} from './store';
import Auth0Lock from './Auth0Lock';

function renderAuth0Lock({login, loginError, ...props}) {
  if (!props.clientId || !props.domain) {
    if (__DEV__) {
      console.log(`Cannot render lock until 'clientId' and 'domain' are provided.`);
    }
    return false;
  }

  return <Auth0Lock onLogin={login} onAuthorizationError={loginError} onUnrecoverableError={loginError} {...props} />;
}

export const RequireAuth0 = ({children, renderLogin, isAuthenticated, ...props}) => {
  console.log(`REQUIRE AUTH0 ${isAuthenticated}`);
  if (isAuthenticated) {
    return children;
  }

  if (renderLogin) {
    return renderLogin(props);
  }

  return renderAuth0Lock(props);
};

RequireAuth0.propTypes = {
  /**
   * Children to render if the user is logged in.  Not rendered if user is not logged in
   */
  children: PropTypes.node,
  /**
   * Optional function to use to render the Login screen if the user is not logged in.
   * Will be passed a props object with all of the props supplied to us along with
   * clientId, domain, error, login, loginError
   *
   * If not supplied, then the Auth0Lock will be rendered
   */
  renderLogin: PropTypes.func,

  // from connect()
  clientId: PropTypes.string,
  domain: PropTypes.string,
  error: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
  loginError: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const {clientId, domain, error} = getAuth0(state);
  return {
    clientId,
    domain,
    error,
    isAuthenticated: getIsAuthenticated(state),
  };
}

const mapDispatchToProps = { loginError, login };

const options = {
  pure: true,
  areStatesEqual: (next, prev) => getAuth0(next) === getAuth0(prev),
};

const RequireAuth0Container = connect(mapStateToProps, mapDispatchToProps, undefined, options)(RequireAuth0);

RequireAuth0Container.propTypes = {
  /**
   * Children to render if the user is logged in.  Not rendered if user is not logged in
   */
  children: PropTypes.node,
  /**
   * Optional function to use to render the Login screen if the user is not logged in.
   * Will be passed a props object with all of the props supplied to us along with
   * clientId, domain, error, login, loginError
   *
   * If not supplied, then the Auth0Lock will be rendered
   */
  renderLogin: PropTypes.func,
  // any other props are passed through to the login view
};

export default RequireAuth0Container;
