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

export const PageLayout = ({ children, history }) => (
  <div className="container text-center">
    <h1>React Redux Starter Kit</h1>
    <NavLink to="/" exact activeClassName="page-layout__nav-item--active">Home</NavLink>
    {' · '}
    <NavLink to="/counter" activeClassName="page-layout__nav-item--active">Counter</NavLink>
    <Auth0Lock clientId="4bleMmUdPo1KoNeXNo71hwRBZgfHAej7" domain="experoinc.auth0.com" onLogin={onLogin} ui={{ closable: false }} redirectMode history={history} redirectUrl={REDIRECT_URL}/>
    <div className="page-layout__viewport">
      {children}
    </div>
  </div>
);
PageLayout.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object,
};

export default PageLayout;
