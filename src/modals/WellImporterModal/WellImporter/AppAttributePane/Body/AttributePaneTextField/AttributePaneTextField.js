import React, { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { InputAdornment } from "@material-ui/core";
import TextField from "../../../../../../components/TextField";
import { CheckCircleOutline } from "@material-ui/icons";

import { INPUT_TYPES } from "../../../constants";

import css from "./styles.scss";

const AttributePaneTextField = ({
  appAttributeConfig,
  appAttributeModel,
  onFocus,
  fieldKey,
  sectionKey,
  isFocused = false
}) => {
  const inputRef = useRef(null);
  const innerRef = useRef(null);

  const handleBlur = useCallback(() => {
    // onBlur, if the field is active and the user is clicking the table or
    // elsewhere on the page, we want to refocus the input field so it appears active
    if (isFocused) {
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 0);
    }
  }, [inputRef, isFocused]);

  const onClickTextField = useCallback(
    event => onFocus(event, appAttributeConfig, appAttributeModel, fieldKey, sectionKey),
    [onFocus, appAttributeConfig, appAttributeModel, fieldKey, sectionKey]
  );

  useEffect(() => {
    if (isFocused) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [isFocused]);

  return (
    <div className={css.textFieldContainer} onMouseDown={onClickTextField}>
      <TextField
        key={`input-${fieldKey}`}
        inputRef={inputRef}
        innerRef={innerRef}
        variant="filled"
        label={appAttributeConfig.labelName}
        fullWidth
        InputProps={{
          endAdornment:
            appAttributeModel.value !== "" && appAttributeConfig.required ? (
              <InputAdornment position="end">
                <CheckCircleOutline />
              </InputAdornment>
            ) : null
        }}
        helperText={isFocused ? "Choose the appropriate value from LAS file on right" : ""}
        onBlur={handleBlur}
        value={appAttributeModel.value}
      />
    </div>
  );
};

AttributePaneTextField.defaultProps = {
  isFocused: false,
  type: INPUT_TYPES.CELL,
  classes: {}
};

AttributePaneTextField.propTypes = {
  appAttributeConfig: PropTypes.object.isRequired,
  appAttributeModel: PropTypes.object.isRequired,
  onFocus: PropTypes.func.isRequired,
  fieldKey: PropTypes.string.isRequired,
  sectionKey: PropTypes.string.isRequired,
  isFocused: PropTypes.bool
};

export default AttributePaneTextField;
