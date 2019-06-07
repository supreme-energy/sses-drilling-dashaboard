import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import useMemo from "react-powertools/hooks/useMemo";
import debounce from "lodash/debounce";
import TextField from "./TextField";

function DebouncedTextField({ value, onChange, debounceInterval, ...rest }) {
  const [, updateTick] = useState(false);
  const internalState = useRef({ actualValue: value, prevValue: value });

  const onChangeDebounce = useMemo(() => debounce(onChange, debounceInterval), [onChange, debounceInterval]);

  useMemo(() => {
    internalState.current.actualValue = value;
  }, [value]);

  return (
    <TextField
      {...rest}
      value={internalState.current.actualValue}
      onChange={e => {
        console.log("value", e.target.value);
        internalState.current.actualValue = e.target.value;
        updateTick(tick => !tick);
        onChangeDebounce(e.target.value);
      }}
    />
  );
}

DebouncedTextField.propsTypes = {
  debounceInterval: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.string
};
DebouncedTextField.defaultProps = {
  debounceInterval: 400,
  onChange: () => {},
  value: ""
};

export default DebouncedTextField;
