import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import debouncePromise from "awesome-debounce-promise";
import TextField from "./TextField";
import uniqueId from "lodash/uniqueId";

const defaultProps = {
  debounceInterval: 1000,
  onChange: () => {},
  value: "",
  format: d => d
};

export const useDebounceSave = ({ value, onSave, debounceInterval }) => {
  const [internalValue, setInternalValue] = useState(null);
  const internalState = useRef({});
  const saveDebounced = useCallback(debouncePromise(onSave, debounceInterval), [debounceInterval, onSave]);

  const saveValue = useCallback(
    async (value, requestId) => {
      await saveDebounced(value);
      return requestId;
    },
    [saveDebounced]
  );

  const onChangeHandler = useCallback(
    async e => {
      const requestId = uniqueId();
      internalState.current.lastRequestId = requestId;
      setInternalValue(e.target.value);

      let resultRequestId;
      try {
        resultRequestId = await saveValue(e.target.value);
      } finally {
        if (resultRequestId === internalState.current.lastRequestId) {
          setInternalValue(null);
        }
      }
    },
    [saveValue]
  );

  return [internalValue !== null ? internalValue : value, onChangeHandler];
};

export function DebouncedTextField({ value, onChange, debounceInterval, format, ...inputProps }) {
  const [actualValue, onChangeHandler] = useDebounceSave({ value, onSave: onChange, debounceInterval });

  return <TextField {...inputProps} value={format(actualValue)} onChange={onChangeHandler} />;
}

DebouncedTextField.propsTypes = {
  debounceInterval: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.string
};

DebouncedTextField.defaultProps = defaultProps;

export const NumericDebouceTextField = React.memo(props => {
  return (
    <DebouncedTextField
      type="number"
      {...props}
      onChange={value => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          return props.onChange(numericValue);
        }
      }}
    />
  );
});
