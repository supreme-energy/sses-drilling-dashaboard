import React, { useMemo } from "react";
import PropTypes from "prop-types";

import Search from "../../../../../components/Search";
import ValidationButton from "./ValidationButton";

import css from "./styles.scss";

const Header = ({ sectionMapping, appAttributesFieldMapping, appAttributesModel }) => {
  const validationButtons = useMemo(
    () =>
      Object.keys(appAttributesModel).map(key => {
        const sectionInfoMapping = sectionMapping[key];
        const model = appAttributesModel[key];
        const fieldMapping = appAttributesFieldMapping[key];

        return <ValidationButton model={model} fieldMapping={fieldMapping} sectionInfoMapping={sectionInfoMapping} />;
      }),
    [sectionMapping, appAttributesFieldMapping, appAttributesModel]
  );

  return (
    <div className={css.container}>
      <Search onChange={() => {}} placeholder="Search attribute" />
      <div className={css.validationContainer}>{validationButtons}</div>
    </div>
  );
};

Header.propTypes = {
  sectionMapping: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  appAttributesModel: PropTypes.object.isRequired
};

export default Header;
