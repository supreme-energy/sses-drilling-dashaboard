import React, { useCallback } from "react";
import { Typography } from "@material-ui/core";
import noop from "lodash/noop";
import classes from "../ComboDashboard.scss";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../App/Containers";
import { NumericTextField } from "../../../../components/DebouncedInputs";

const IDENTITY_FCT = a => a;

export const WellInfoField = ({ field, label, options = {}, onAfterUpdate, ...textProps }) => {
  const { wellId } = useWellIdContainer();
  const [data, , updateWell] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};
  const mask = options.mask || IDENTITY_FCT;
  const debounceAction = options.debounceAction || noop;

  const changeHandler = useCallback(
    async value => {
      await debounceAction(mask(value));
      await updateWell({ wellId, field, value });
      onAfterUpdate();
    },
    [debounceAction, field, updateWell, wellId, mask, onAfterUpdate]
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2">{`${label}: `}</Typography>
      <NumericTextField
        variant="filled"
        format={mask}
        debug={field === "projdip"}
        field={field}
        value={wellInfo[field]}
        onChange={changeHandler}
        className={classes.textField}
        {...textProps}
      />
    </React.Fragment>
  );
};

WellInfoField.defaultProps = {
  onAfterUpdate: IDENTITY_FCT
};

export default WellInfoField;
