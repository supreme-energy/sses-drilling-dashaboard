import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './PageLayout.scss';
import Auth0Lock from 'expero-react-labs/components/Auth0Lock';

function onLogin({profile, idToken, accessToken, state}) {
  console.log(`login: ${JSON.stringify(profile)}`);
  console.log(idToken);
  console.log(state);
}

const REDIRECT_URL = `${window.location.protocol}//${window.location.host}/`;

export const PageLayout = ({ children, history, auth0 }) => (
  <div className="container text-center">
    <h1>React Redux Starter Kit</h1>
    <NavLink to="/" exact activeClassName="page-layout__nav-item--active">Home</NavLink>
    {' · '}
    <NavLink to="/counter" activeClassName="page-layout__nav-item--active">Counter</NavLink>
    <Auth0Lock clientId={auth0.clientId} domain={auth0.domain} onLogin={onLogin} ui={{ closable: false }}
      redirectMode history={history} redirectUrl={REDIRECT_URL} error={auth0.error} />
    {/*
    <Auth0Lock clientId={auth0.clientId} domain={auth0.domain} onLogin={onLogin} ui={{ closable: false }} />
     */}
    <div className="page-layout__viewport">
      {children}
    </div>
  </div>
);
PageLayout.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object,
  auth0: PropTypes.shape({
    clientId: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    error: PropTypes.object,
  }).isRequired,
};

export default PageLayout;
