import React, { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import useMemo from "react-powertools/hooks/useMemo";
import debounce from "lodash/debounce";
import TextField from "./TextField";

const defaultProps = {
  debounceInterval: 1000,
  onChange: () => {},
  value: ""
};

export const useDebouncedValue = ({ value, onChange, debounceInterval }) => {
  const [b, tick] = useState(false);
  const internalState = useRef({ prevValue: value, internalValue: value, isPending: false });
  const isPending = internalState.current.isPending;
  const onChangeDebounce = useMemo(
    () =>
      debounce(async newValue => {
        await onChange(newValue);
        // mark that we end the pending update
        internalState.current.isPending = false;
      }, debounceInterval),
    [onChange, debounceInterval]
  );

  const onChangeHandler = useCallback(
    newValue => {
      // mark the start for the pending update (do not allow the external state to be reflected in ui while pending)
      internalState.current.isPending = true;
      // write the new value to internal state to be rendered
      internalState.current.internalValue = newValue;
      // call debounced change handler that will update external state
      onChangeDebounce(newValue);
      // force a new render
      tick(!b);
    },
    [onChangeDebounce, b]
  );

  useEffect(
    function onValueChanged() {
      if (!isPending && internalState.current.prevValue !== value) {
        internalState.current.prevValue = value;
        internalState.current.internalValue = value;
      }
    },
    [value, isPending]
  );

  const valueChanged = internalState.current.prevValue !== value;

  return [valueChanged && !isPending ? value : internalState.current.internalValue, onChangeHandler, onChangeDebounce];
};

export function DebouncedTextField({ value, onChange, debounceInterval, ...rest }) {
  const [actualValue, onChangeHandler] = useDebouncedValue({ value, onChange, debounceInterval });
  return (
    <TextField
      {...rest}
      value={actualValue}
      onChange={e => {
        onChangeHandler(e.target.value);
      }}
    />
  );
}

DebouncedTextField.propsTypes = {
  debounceInterval: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.string
};
DebouncedTextField.defaultProps = defaultProps;
