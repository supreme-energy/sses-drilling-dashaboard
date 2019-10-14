import React, { useCallback } from "react";
import { Typography } from "@material-ui/core";
import noop from "lodash/noop";
import classes from "../ComboDashboard.scss";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../App/Containers";
import { NumericDebouceTextField } from "../../../../components/DebouncedInputs";

const IDENTITY_FCT = a => a;

export const WellInfoField = ({ field, label, options = {}, ...textProps }) => {
  const { wellId } = useWellIdContainer();
  const [data, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};
  const mask = options.mask || IDENTITY_FCT;
  const debounceAction = options.debounceAction || noop;

  const changeHandler = useCallback(
    async value => {
      await debounceAction(value);
      await updateWell({ wellId, field, value: value });
      refreshFetchStore();
    },
    [debounceAction, field, updateWell, refreshFetchStore, wellId]
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2">{`${label}: `}</Typography>
      <NumericDebouceTextField
        debounceInterval={1000}
        variant="filled"
        value={mask(wellInfo[field])}
        onChange={changeHandler}
        className={classes.textField}
        {...textProps}
      />
    </React.Fragment>
  );
};

export default WellInfoField;
