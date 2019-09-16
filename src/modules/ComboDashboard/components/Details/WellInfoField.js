import React, { useCallback, useReducer, useRef } from "react";
import { Typography } from "@material-ui/core";
import classes from "../ComboDashboard.scss";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../App/Containers";
import TextField from "@material-ui/core/TextField";

export const WellInfoField = ({ field, label, options = {}, ...textProps }) => {
  const { wellId } = useWellIdContainer();
  const [data, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};
  const mask = options.mask || (a => a);
  const [, forceRerender] = useReducer(b => !b);
  const internalState = useRef({ value: wellInfo[field] });
  const debouncedFieldSave = useCallback(
    _.debounce(async () => {
      await updateWell({ wellId, field, value: internalState.current.value });
      refreshFetchStore();
    }, 100),
    [updateWell, wellId, refreshFetchStore]
  );

  const changeHandler = useCallback(
    e => {
      internalState.current.value = mask(e.target.value);
      forceRerender();
      debouncedFieldSave();
    },
    [debouncedFieldSave]
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
