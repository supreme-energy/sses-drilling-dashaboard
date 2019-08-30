import React, { useCallback, useMemo } from "react";
import { Typography } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import classes from "../ComboDashboard.scss";
import FilledInput from "@material-ui/core/FilledInput";
import MenuItem from "@material-ui/core/MenuItem";
import { DIP_FAULT_POS_VS, MD_INC_AZ, TVD_VS } from "../../../../constants/calcMethods";
import classNames from "classnames";
import projectionStatic from "../../../../assets/projectionStatic.svg";
import projectionDirectional from "../../../../assets/projectionDirectional.svg";
import projectAheadSVG from "../../../../assets/projectionAutoDip.svg";
import { useUpdateSegmentsById } from "../../../Interpretation/actions";

export default function selectedProjectionMethod({ selectedProjection }) {
  const updateSegments = useUpdateSegmentsById();
  const updateSelectedPAMethod = useCallback(
    e => {
      console.log(e.target.value);
      updateSegments({ [selectedProjection.id]: { method: Number(e.target.value) } });
    },
    [updateSegments, selectedProjection]
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2">Projection Method: </Typography>
      <Select
        value={selectedProjection.method}
        variant="filled"
        onChange={updateSelectedPAMethod}
        className={classes.methodSelect}
        input={<FilledInput name="age" id="filled-age-simple" />}
      >
        <MenuItem value={TVD_VS}>
          <img className={classNames(classes.paIcon)} src={projectionStatic} alt="static projection" />
          Static
        </MenuItem>
        <MenuItem value={MD_INC_AZ}>
          <img className={classNames(classes.paIcon)} src={projectionDirectional} alt="static projection" />
          Directional
        </MenuItem>
        <MenuItem value={DIP_FAULT_POS_VS}>
          <img className={classNames(classes.paIcon)} src={projectAheadSVG} alt="static projection" />
          Auto
        </MenuItem>
      </Select>
    </React.Fragment>
  );
}
