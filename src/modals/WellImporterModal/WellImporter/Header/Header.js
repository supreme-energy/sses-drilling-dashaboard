import React from "react";
import PropTypes from "prop-types";
import {AppBar} from "@material-ui/core";

import LASAttributePaneHeader from "../LASAttributePane/Header";
import css from "./styles.scss";

const Header = ({className, data, onClickCancel}) => {
  return (
    <AppBar className={className} position="relative">
      <div className={css.appAttributePaneHeaderContainer}></div>
      <div className={css.lasAttributePaneHeaderContainer}>
        <LASAttributePaneHeader data={data} onClickCancel={onClickCancel} />
      </div>
    </AppBar>
  );
};

Header.defaultProps = {
  className: css.appBar
};

Header.propTypes = {
  data: PropTypes.object.isRequired,
  className: PropTypes.string,
  onClickCancel: PropTypes.func
};

export default Header;
