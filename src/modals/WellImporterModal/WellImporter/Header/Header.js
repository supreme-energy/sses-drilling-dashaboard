import React from "react";
import PropTypes from "prop-types";
import { AppBar } from "@material-ui/core";

import LASAttributePaneHeader from "../LASAttributePane/Header";
import AppAttributePaneHeader from "../AppAttributePane/Header";

import css from "./styles.scss";

const Header = ({
  appAttributesModel,
  appAttributesFieldMapping,
  sectionMapping,
  className,
  onClickCancel,
  activateInput
}) => {
  return (
    <AppBar className={className} position="relative" color="inherit">
      <div className={css.appAttributePaneHeaderContainer}>
        <AppAttributePaneHeader
          appAttributesModel={appAttributesModel}
          appAttributesFieldMapping={appAttributesFieldMapping}
          sectionMapping={sectionMapping}
          activateInput={activateInput}
        />
      </div>
      <div className={css.lasAttributePaneHeaderContainer}>
        <LASAttributePaneHeader onClickCancel={onClickCancel} />
      </div>
    </AppBar>
  );
};

Header.defaultProps = {
  className: css.appBar
};

Header.propTypes = {
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  sectionMapping: PropTypes.object.isRequired,
  activateInput: PropTypes.func.isRequired,
  className: PropTypes.string,
  onClickCancel: PropTypes.func
};

export default Header;
