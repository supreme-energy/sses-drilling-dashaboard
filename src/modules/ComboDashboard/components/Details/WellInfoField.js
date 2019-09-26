import React, { useCallback, useReducer, useRef } from "react";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import debounce from "lodash/debounce";
import noop from "lodash/noop";
import classes from "../ComboDashboard.scss";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../App/Containers";

export const WellInfoField = ({ field, label, options = {}, ...textProps }) => {
  const { wellId } = useWellIdContainer();
  const [data, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};
  const mask = options.mask || (a => a);
  const debounceAction = options.debounceAction || noop;
  const immediateAction = options.immediateAction || noop;
  const [, forceRerender] = useReducer(b => !b);
  const internalState = useRef({ value: wellInfo[field] });
  const debouncedFieldSave = useCallback(
    debounce(async () => {
      await debounceAction(internalState.current.value);
      await updateWell({ wellId, field, value: internalState.current.value });
      refreshFetchStore();
    }, 1000),
    [debounceAction, updateWell, wellId, refreshFetchStore]
  );

  const changeHandler = useCallback(
    e => {
      internalState.current.value = mask(e.target.value);
      immediateAction(internalState.current.value);
      forceRerender();
      debouncedFieldSave();
    },
    [immediateAction, debouncedFieldSave, mask]
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2">{`${label}: `}</Typography>
      <TextField
        debounceInterval={100}
        variant="filled"
        value={internalState.current.value}
        onChange={changeHandler}
        className={classes.textField}
        {...textProps}
      />
    </React.Fragment>
  );
};

export default WellInfoField;
