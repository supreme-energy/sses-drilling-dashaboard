import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import debouncePromise from "awesome-debounce-promise";
import TextField from "./TextField";
import MaterialTextField from "@material-ui/core/TextField";
import uniqueId from "lodash/uniqueId";
import useMemo from "react-powertools/hooks/useMemo";
import { twoDecimalsNoComma } from "../constants/format";
import hoc from "react-powertools/hoc";

const defaultProps = {
  debounceInterval: 1000,
  onChange: () => {},
  value: "",
  format: d => d
};

export const useDebounceSave = ({ onSave, debounceInterval, value, isFocused }) => {
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
  useMemo(() => {
    const isFocusedChangedToTrue = isFocused && isFocused !== internalState.current.prevIsFocused;
    (!isFocused || isFocusedChangedToTrue) && setState(state => ({ ...state, internalValue: value }));
  }, [value, isFocused]);

  internalState.current.prevIsFocused = isFocused;
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

export const withFocusState = hoc(Component => props => {
  const [isFocused, updateIsFocused] = useState(false);
  return (
    <Component
      {...props}
      isFocused={isFocused}
      onFocus={e => {
        updateIsFocused(true);
        props.onFocus && props.onFocus(e);
      }}
      onBlur={e => {
        props.onBlur && props.onBlur(e);
        updateIsFocused(false);
      }}
    />
  );
});

export const DebouncedTextField = withFocusState(
  ({ value, onChange, debounceInterval, format, isFocused, ...inputProps }) => {
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
        onChange={onChangeHandler}
      />
    );
  }
);

DebouncedTextField.propsTypes = {
  debounceInterval: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.string
};

DebouncedTextField.defaultProps = defaultProps;

const ensureNumberValue = hoc(InputComp => {
  return withFocusState(props => {
    const [pendingValue, updatePendingValue] = useState(props.value);
    const { value } = props;
    useMemo(() => updatePendingValue(value), [value]);

    return (
      <InputComp
        type="number"
        {...props}
        value={props.isFocused ? pendingValue : twoDecimalsNoComma(props.value)}
        onChange={value => {
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            return props.onChange(numericValue);
          } else {
            updatePendingValue(value);
          }
        }}
      />
    );
  });
});

export const NumericTextField = ensureNumberValue(props => (
  <MaterialTextField {...props} onChange={e => props.onChange(e.target.value)} />
));

NumericTextField.defaultProps = {
  onChange: e => e
};

export const NumericDebouceTextField = React.memo(ensureNumberValue(DebouncedTextField));
