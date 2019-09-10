import React, { useCallback } from "react";
import { Typography } from "@material-ui/core";
import { DebouncedTextField } from "../../../../components/DebouncedInputs";
import classes from "../ComboDashboard.scss";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../App/Containers";

export const AutoPosTCLField = () => {
  const { wellId } = useWellIdContainer();
  const [data, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};
  const updateAutoPosTCL = useCallback(
    async value => {
      await updateWell({ wellId, field: "autoposdec", value });
      refreshFetchStore();
    },
    [updateWell, wellId, refreshFetchStore]
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2">Auto Pos-TCL: </Typography>
      <DebouncedTextField
        debounceInterval={100}
        type="number"
        variant="filled"
        inputProps={{ min: "0" }}
        value={wellInfo.autoposdec}
        onChange={updateAutoPosTCL}
        className={classes.textField}
      />
    </React.Fragment>
  );
};

export default AutoPosTCLField;
