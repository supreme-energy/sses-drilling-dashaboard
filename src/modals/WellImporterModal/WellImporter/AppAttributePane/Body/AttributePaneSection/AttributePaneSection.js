import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import AttributePaneTextField from "../AttributePaneTextField";

import css from "./styles.scss";

const AttributePaneSection = ({ sectionTitle, sectionKey, onFocus, mapping, model, activeInput }) => {
  const attributePaneTextFields = useMemo(() => {
    return Object.keys(model).map(key => {
      const partialModel = model[key];
      const config = mapping[key];
      return (
        <AttributePaneTextField
          key={`wellInfo-${key}`}
          fieldKey={key}
          sectionKey={sectionKey}
          appAttributeConfig={config}
          appAttributeModel={partialModel}
          onFocus={onFocus}
          value={partialModel.value}
          isFocused={activeInput && activeInput.sectionKey === sectionKey && activeInput.fieldKey === key}
          type={config.type}
        />
      );
    });
  }, [sectionKey, activeInput, onFocus, mapping, model]);

  return (
    <div>
      <div className={css.sectionTitle}>
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
