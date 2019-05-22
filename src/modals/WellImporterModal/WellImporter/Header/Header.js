import React from "react";
import PropTypes from "prop-types";
import { AppBar } from "@material-ui/core";

import LASAttributePaneHeader from "../LASAttributePane/Header";
import AppAttributePaneHeader from "../AppAttributePane/Header";

import css from "./styles.scss";

const Header = ({ data, appAttributesModel, appAttributesFieldMapping, sectionMapping, className, onClickCancel }) => {
  return (
    <AppBar className={className} position="relative">
      <div className={css.appAttributePaneHeaderContainer}>
        <AppAttributePaneHeader
          appAttributesModel={appAttributesModel}
          appAttributesFieldMapping={appAttributesFieldMapping}
          sectionMapping={sectionMapping}
        />
      </div>
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
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  sectionMapping: PropTypes.object.isRequired,
  className: PropTypes.string,
  onClickCancel: PropTypes.func
};

export default Header;
