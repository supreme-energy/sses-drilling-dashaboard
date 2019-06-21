import React from "react";
import PropTypes from "prop-types";
import AttributePaneSection from "./AttributePaneSection";
import { useSelector } from "react-redux";
import { useWellInfo } from "../../../../../api";

const Body = ({ appAttributesModel, appAttributesFieldMapping, onFocus, activeInput }) => {
  const { wellInfo, wellParameters, wellData } = appAttributesModel;

  const {
    wellInfo: wellInfoFieldMapping,
    wellParameters: wellParametersFieldMapping,
    wellData: wellDataFieldMapping
  } = appAttributesFieldMapping;

  const selectedWellId = useSelector(state => state.wellExplorer.selectedWellId);
  const [currentData] = useWellInfo(selectedWellId);

  return (
    <React.Fragment>
      <AttributePaneSection
        sectionTitle="Well Information"
        currentData={currentData.wellInfo}
        onFocus={onFocus}
        mapping={wellInfoFieldMapping}
        model={wellInfo}
        activeInput={activeInput}
        sectionKey="wellInfo"
      />
      <AttributePaneSection
        currentData={currentData.wellInfo}
        sectionTitle="Well Parameters"
        wellData={wellData}
        onFocus={onFocus}
        mapping={wellParametersFieldMapping}
        model={wellParameters}
        activeInput={activeInput}
        sectionKey="wellParameters"
      />
      <AttributePaneSection
        currentData={currentData.wellInfo}
        sectionTitle="Well Data"
        wellData={wellData}
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
