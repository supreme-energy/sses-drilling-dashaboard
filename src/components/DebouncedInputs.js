import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import debouncePromise from "awesome-debounce-promise";
import TextField from "./TextField";
import uniqueId from "lodash/uniqueId";
import useMemo from "react-powertools/hooks/useMemo";

const defaultProps = {
  debounceInterval: 1000,
  onChange: () => {},
  value: "",
  format: d => d
};

export const useDebounceSave = ({ onSave, debounceInterval, value }) => {
  const [{ internalValue, isPending }, setState] = useState({ internalValue: "", isPending: false });
  const internalState = useRef({});
  const saveDebounced = useCallback(debouncePromise(onSave, debounceInterval), [debounceInterval, onSave]);

  const saveValue = useCallback(
    async (value, requestId) => {
      await saveDebounced(value);
      return requestId;
    },
    [saveDebounced]
  );

  // sync internal state value with value
  useMemo(() => setState(state => ({ ...state, internalValue: value })), [value]);

  const onChangeHandler = useCallback(
    async e => {
      const requestId = uniqueId();
      internalState.current.lastRequestId = requestId;
      const value = e.target.value;
      setState(state => ({ ...state, internalValue: value, isPending: true }));

      let resultRequestId;
      try {
        resultRequestId = await saveValue(value, requestId);
      } finally {
        if (resultRequestId === internalState.current.lastRequestId) {
          setState(state => ({ ...state, isPending: false }));
        }
      }
    },
    [saveValue]
  );

  return [internalValue, isPending, onChangeHandler];
};

export function DebouncedTextField({ value, onChange, debounceInterval, format, ...inputProps }) {
  const [isFocused, updateIsFocused] = useState(false);
  const [internalValue, isPending, onChangeHandler] = useDebounceSave({
    value,
    onSave: onChange,
    debounceInterval,
    isFocused
  });

  return (
    <TextField
      {...inputProps}
      value={format(isPending || isFocused ? internalValue : value)}
      onFocus={() => updateIsFocused(true)}
      onBlur={e => {
        inputProps.onBlur && inputProps.onBlur(e);
        updateIsFocused(false);
      }}
      onChange={onChangeHandler}
    />
  );
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
