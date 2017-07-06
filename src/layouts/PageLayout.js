import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './PageLayout.scss';
import {connect} from 'react-redux';
import {getAuth0, getIsAuthenticated, logout} from 'expero-react-labs/auth0/store';

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
}

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

export const PageLayout = ({ children, history }) => (
  <div className="container text-center">
    <UserInfoContainer />
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
