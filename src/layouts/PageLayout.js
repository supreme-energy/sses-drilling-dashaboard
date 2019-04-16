import React from "react";
import PropTypes from "prop-types";

import { MuiThemeProvider } from "@material-ui/core";
import { theme } from "../styles/theme";
import classes from "./PageLayout.scss";

export const PageLayout = ({ children, history }) => (
  <MuiThemeProvider theme={theme}>
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.logo}>
          <img src="/logo_sses.svg" />
        </div>
        {/* <NavLink to="/" exact activeClassName={classes.navItemActive}>
          Well Explorer
        </NavLink>
        <NavLink to="/combo" exact activeClassName={classes.navItemActive}>
          Combo Dashboard
        </NavLink>
        <NavLink to="/drilling" exact activeClassName={classes.navItemActive}>
          Drilling Analytics
        </NavLink>
        <NavLink to="/structural" exact activeClassName={classes.navItemActive}>
          Structural Guidance
        </NavLink>
        <NavLink to="/directional" exact activeClassName={classes.navItemActive}>
          Directional Guidance
        </NavLink> */}
      </div>

      <div className={classes.viewport}>{children}</div>
    </div>
  </MuiThemeProvider>
);

PageLayout.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object
};

export default PageLayout;
