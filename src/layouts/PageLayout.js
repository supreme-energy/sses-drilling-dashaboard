import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import './PageLayout.scss';

export const PageLayout = ({ children, history }) => (
  <div className="container text-center">
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
