import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {initializeAuth, getAuth0, connectOptions} from './store';

class Auth0RedirectHandler extends React.Component {
  static propTypes = {
    clientId: PropTypes.string,
    domain: PropTypes.string,
    history: PropTypes.object,
    children: PropTypes.node,

    // From connect
    status: PropTypes.string.isRequired,
    initializeAuth: PropTypes.func.isRequired,
  };

  render() {
    // do not render the children until we've done the redirect processing
    return (this.props.status === "initialized") && this.props.children;
  }

  componentDidMount() {
    this.initializeAuth();
  }

  componentDidUpdate(prevProps) {
    this.initializeAuth();
  }

  initializeAuth() {
    const {clientId, domain, history, initializeAuth, status} = this.props;

    // If we have what we need to initialize and auth0 has not already been initialized...
    if (clientId && domain && status === "uninitialized") {
      initializeAuth(clientId, domain, history);
    }
  }
}

function mapStateToProps(state) {
  const {status} = getAuth0(state);
  return {status};
}

const Auth0RedirectHandlerContainer = connect(mapStateToProps, {initializeAuth}, undefined, connectOptions)(Auth0RedirectHandler);

Auth0RedirectHandlerContainer.propTypes = {
  /**
   * The Auth0 clientID
   */
  clientId: PropTypes.string,
  /**
   * The Auth0 Domain
   */
  domain: PropTypes.string,
  /**
   * Optional History object.  If provided, then after a auth redirect, the URL will be restored to what it was before
   * the auth redirect occurred
   */
  history: PropTypes.object,
  /**
   * The children to render once auth0 is initialized
   */
  children: PropTypes.node,
};

export default Auth0RedirectHandlerContainer;
