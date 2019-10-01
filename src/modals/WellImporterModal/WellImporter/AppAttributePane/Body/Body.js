import React, { useMemo } from "react";
import PropTypes from "prop-types";
import AttributePaneSection from "./AttributePaneSection";
import { useSelector } from "react-redux";
import { useWellInfo } from "../../../../../api";

const Body = ({ appAttributesModel, appAttributesFieldMapping, onFocus, activeInput, pendingCreateWell }) => {
  const { wellInfo, wellParameters, wellData } = appAttributesModel;

  const {
    wellInfo: wellInfoFieldMapping,
    wellParameters: wellParametersFieldMapping,
    wellData: wellDataFieldMapping
  } = appAttributesFieldMapping;

  const selectedWellId = useSelector(state => state.wellExplorer.selectedWellId);
  const [data] = useWellInfo(selectedWellId);

  const currentData = useMemo(
    function getCurrentData() {
      if (!selectedWellId || !data.wellInfo || !data.wellSurfaceLocation) {
        return null;
      }

      return {
        ...data.wellInfo,
        transform: data.transform,
        latitude: data.wellSurfaceLocation.x,
        longitude: data.wellSurfaceLocation.y
      };
    },
    [data, selectedWellId]
  );

  return (
    <React.Fragment>
      <AttributePaneSection
        sectionTitle="Well Information"
        currentData={currentData}
        onFocus={onFocus}
        mapping={wellInfoFieldMapping}
        model={wellInfo}
        activeInput={activeInput}
        sectionKey="wellInfo"
      />
      <AttributePaneSection
        currentData={currentData}
        sectionTitle="Well Parameters"
        wellData={wellData}
        onFocus={onFocus}
        mapping={wellParametersFieldMapping}
        model={wellParameters}
        activeInput={activeInput}
        sectionKey="wellParameters"
      />
      {!pendingCreateWell && (
        <AttributePaneSection
          currentData={currentData}
          sectionTitle="Well Data"
          wellData={wellData}
          onFocus={onFocus}
          mapping={wellDataFieldMapping}
          model={wellData}
          activeInput={activeInput}
          sectionKey="wellData"
        />
      )}
    </React.Fragment>
  );
};

Body.propTypes = {
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  onFocus: PropTypes.func.isRequired,
  activeInput: PropTypes.object,
  pendingCreateWell: PropTypes.bool
};

export default Body;
