import React from "react";
import PropTypes from "prop-types";
import AttributePaneSection from "./AttributePaneSection";

const Body = ({ appAttributesModel, appAttributesFieldMapping, onFocus, activeInput }) => {
  const { wellInfo, wellParameters, wellData } = appAttributesModel;

  const {
    wellInfo: wellInfoFieldMapping,
    wellParameters: wellParametersFieldMapping,
    wellData: wellDataFieldMapping
  } = appAttributesFieldMapping;

  return (
    <React.Fragment>
      <AttributePaneSection
        sectionTitle="Well Information"
        onFocus={onFocus}
        mapping={wellInfoFieldMapping}
        model={wellInfo}
        activeInput={activeInput}
        sectionKey="wellInfo"
      />
      <AttributePaneSection
        sectionTitle="Well Parameters"
        onFocus={onFocus}
        mapping={wellParametersFieldMapping}
        model={wellParameters}
        activeInput={activeInput}
        sectionKey="wellParameters"
      />
      <AttributePaneSection
        sectionTitle="Well Data"
        onFocus={onFocus}
        mapping={wellDataFieldMapping}
        model={wellData}
        activeInput={activeInput}
        sectionKey="wellData"
      />
    </React.Fragment>
  );
};

Body.propTypes = {
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  onFocus: PropTypes.func.isRequired,
  activeInput: PropTypes.object
};

export default Body;
