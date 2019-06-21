import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import AttributePaneTextField from "../AttributePaneTextField";

import css from "./styles.scss";
import { useWellImporterContainer } from "../../..";
import { useParsedFileSelector, getFieldValue } from "../../../selectors";

const wellInfoFieldMapping = {
  api: "wellid",
  country: "country",
  county: "county",
  field: "field",
  jobNumber: "jobnumber",
  location: "location",
  operator: "operatorname",
  rigId: "rigid",
  state: "stateprov",
  well: "wellborename",
  latitude: "latitude",
  longitude: "longitude"
};

const AttributePaneSection = ({ sectionTitle, sectionKey, onFocus, mapping, model, activeInput, currentData }) => {
  const [state] = useWellImporterContainer();
  const { data, extension } = useParsedFileSelector();

  const attributePaneTextFields = useMemo(() => {
    function getModel(model, key) {
      if (currentData) {
        return {
          value: currentData[wellInfoFieldMapping[key]]
        };
      }

      return extension === "csv" ? { value: getFieldValue(state.csvSelection, key, data) } : model[key];
    }

    return Object.keys(model).map(key => {
      const config = mapping[key];
      return (
        <AttributePaneTextField
          key={`wellInfo-${key}`}
          fieldKey={key}
          sectionKey={sectionKey}
          appAttributeConfig={config}
          appAttributeModel={getModel(model, key)}
          onFocus={onFocus}
          isFocused={activeInput && activeInput.sectionKey === sectionKey && activeInput.fieldKey === key}
          type={config.type}
        />
      );
    });
  }, [sectionKey, activeInput, onFocus, mapping, model, state.csvSelection, extension, currentData, data]);

  return (
    <div>
      <div className={css.sectionTitle} id={`validation-${sectionKey}`}>
        <Typography className={css.sectionTitleTypography} variant="body1">
          {sectionTitle}
        </Typography>
      </div>
      <div className={css.sectionFieldsContainer}>{attributePaneTextFields}</div>
    </div>
  );
};

AttributePaneSection.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  sectionKey: PropTypes.string.isRequired,
  onFocus: PropTypes.func.isRequired,
  mapping: PropTypes.object.isRequired,
  model: PropTypes.object.isRequired,
  activeInput: PropTypes.object,
  currentData: PropTypes.object
};

export default AttributePaneSection;
