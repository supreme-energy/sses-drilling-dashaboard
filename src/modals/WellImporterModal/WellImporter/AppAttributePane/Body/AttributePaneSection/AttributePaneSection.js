import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import AttributePaneTextField from "../AttributePaneTextField";

import css from "./styles.scss";
import { useWellImporterContainer } from "../../..";
import { useSelector } from "react-redux";
import { useParsedFileSelector, getFieldValue } from "../../../selectors";

const AttributePaneSection = ({ sectionTitle, sectionKey, onFocus, mapping, model, activeInput }) => {
  const [state] = useWellImporterContainer();
  // const files = useSelector(state => {

  //   return state.files.files;
  // });

  console.log("useSelector", useSelector);
  const { data, extension } = useParsedFileSelector();

  const attributePaneTextFields = useMemo(() => {
    return Object.keys(model).map(key => {
      const config = mapping[key];
      console.log("model", model[key]);
      const partialModel = extension === "csv" ? { value: getFieldValue(state.csvSelection, key, data) } : model[key];

      return (
        <AttributePaneTextField
          key={`wellInfo-${key}`}
          fieldKey={key}
          sectionKey={sectionKey}
          appAttributeConfig={config}
          appAttributeModel={partialModel}
          onFocus={onFocus}
          isFocused={activeInput && activeInput.sectionKey === sectionKey && activeInput.fieldKey === key}
          type={config.type}
        />
      );
    });
  }, [sectionKey, activeInput, onFocus, mapping, model, state.csvSelection, extension, data]);

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
  activeInput: PropTypes.object
};

export default AttributePaneSection;
