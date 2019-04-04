import React from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import "./PageLayout.scss";

export const PageLayout = ({ children, history }) => (
  <div className="container text-center">
    <div>
      <img src="/logo_sses.svg" />
    </div>
    <NavLink to="/" exact activeClassName="page-layout__nav-item--active">
      Well Explorer
    </NavLink>
    <NavLink to="/combo" exact activeClassName="page-layout__nav-item--active">
      Combo Dashboard
    </NavLink>
    <NavLink to="/drilling" exact activeClassName="page-layout__nav-item--active">
      Drilling Analytics
    </NavLink>
    <NavLink to="/structural" exact activeClassName="page-layout__nav-item--active">
      Structural Guidance
    </NavLink>
    <NavLink to="/directional" exact activeClassName="page-layout__nav-item--active">
      Directional Guidance
    </NavLink>

    <div className="page-layout__viewport">{children}</div>
  </div>
);

PageLayout.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object
};

export default PageLayout;
