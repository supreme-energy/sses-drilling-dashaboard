import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import AttributePaneTextField from "../AttributePaneTextField";

import css from "./styles.scss";
import { useWellImporterContainer } from "../../..";
import { useParsedFileSelector, getFieldValue, isValueDefined } from "../../../selectors";
import { apiFieldMapping } from "../../../models/mappings";

const AttributePaneSection = ({ sectionTitle, sectionKey, onFocus, mapping, model, activeInput, currentData }) => {
  const [{ csvSelection, pendingCreateWell, pendingCreateWellName }] = useWellImporterContainer();
  const { data, extension } = useParsedFileSelector();

  const attributePaneTextFields = useMemo(() => {
    function getModel(model, key) {
      if (key === "well" && pendingCreateWell) {
        return { value: pendingCreateWellName };
      }
      let value = extension === "csv" ? getFieldValue(csvSelection, key, data) : model[key].value;
      const notSelected = !isValueDefined(value);

      if (currentData && notSelected) {
        value = currentData[apiFieldMapping[key]];
      }

      return { value };
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
  }, [
    sectionKey,
    activeInput,
    onFocus,
    mapping,
    model,
    csvSelection,
    extension,
    currentData,
    data,
    pendingCreateWell,
    pendingCreateWellName
  ]);

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
