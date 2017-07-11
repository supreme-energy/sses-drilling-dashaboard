import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './PageLayout.scss';
import {connect} from 'react-redux';
import {getAuth0, getIsAuthenticated, logout} from 'expero-react-labs/auth0/store';
import withFetchClient from 'expero-react-labs/data/withFetchClient';

const userInfoStyles = {
  root: {
    position: "absolute",
    top: "5px",
    right: "5px",
    display: "inline-block",
  },
  picture: {
    borderRadius: "50%",
    width: 32,
    height: 32,
    marginRight: 10,
  }
};

const UserInfo = ({isAuthenticated, profile, logout}) => {
  if (!isAuthenticated) {
    return (
      <div style={userInfoStyles.root}>
        Not Logged In
      </div>
    );
  }

  return (
    <div style={userInfoStyles.root}>
      <img src={profile.picture} width="32" height="32" style={userInfoStyles.picture}
        title={`Hello ${profile.name}`} />
      <a href="#" onClick={logout}>Logout</a>
    </div>
  );
};

function getUserInfo(state) {
  return {
    isAuthenticated: getIsAuthenticated(state),
    profile: getAuth0(state).profile,
  };
}

const userInfoActions = {
  logout(ev) {
    ev.preventDefault();
    return logout();
  }
};

const UserInfoContainer = connect(getUserInfo, userInfoActions)(UserInfo);

const serverStatusStyles = {
  root: {
    position: "absolute",
    top: "5px",
    left: "5px",
    display: "inline-block",
  },
};

const ServerStatus = ({data}) => {
  const {error, loading, polling, result} = data;

  let msg = "Server Status: ";
  if (result) {
    msg += `${result.status} Last Check: ${result.time.toISOString()}`;
  }

  if (loading) {
    msg += " (Loading)";
  }

  if (polling) {
    msg += " (Checking)";
  }

  if (error) {
    msg += ` [Error: ${error.message}]`;
  }

  return <div style={serverStatusStyles.root}>{msg}</div>;
};

const ServerStatusContainer = withFetchClient("/health-check", null, {
  pollInterval: 2000,
  transform: result => ({status: result.status, time: new Date(result.time)})
})(ServerStatus);

export const PageLayout = ({ children, history }) => (
  <div className="container text-center">
    <UserInfoContainer />
    <ServerStatusContainer />
    <h1>React Redux Starter Kit</h1>
    <NavLink to="/" exact activeClassName="page-layout__nav-item--active">Home</NavLink>
    {' · '}
    <NavLink to="/counter" activeClassName="page-layout__nav-item--active">Counter</NavLink>
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
