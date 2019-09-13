import React, { useCallback } from "react";
import { Typography } from "@material-ui/core";
import { DebouncedTextField } from "../../../../components/DebouncedInputs";
import classes from "../ComboDashboard.scss";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../App/Containers";

export const WellInfoField = ({ field, label, ...textProps }) => {
  const { wellId } = useWellIdContainer();
  const [data, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};
  const updateValue = useCallback(
    async value => {
      await updateWell({ wellId, field, value });
      refreshFetchStore();
    },
    [updateWell, wellId, refreshFetchStore]
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2">{`${label}: `}</Typography>
      <DebouncedTextField
        debounceInterval={100}
        variant="filled"
        value={wellInfo[field]}
        onChange={updateValue}
        className={classes.textField}
        {...textProps}
      />
    </React.Fragment>
  );
};

export default WellInfoField;
