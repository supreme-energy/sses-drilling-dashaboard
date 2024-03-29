import React from "react";
import { Typography } from "@material-ui/core";
import { withTheme } from "@material-ui/core/styles";
import classes from "./styles.scss";
import { useSelectedWellInfoContainer } from "../App/Containers";

// TODO: GET data from ASTRA to populate TargetAccuracy
// Once data type is known, this component MAY use the form
// of KpiItem in KpiItem.js
function TargetAccuracy({ theme }) {
  const [{ zoneStatus }] = useSelectedWellInfoContainer();

  const color = zoneStatus ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <div className={classes.zoneStatus}>
      <div className={classes.horizontalCenter}>
        <Typography variant="h5" style={{ color }}>
          {zoneStatus || "In Zone"}
        </Typography>
      </div>
      <Typography className={classes.italicLabel} variant="caption" gutterBottom>
        Target Accuracy
      </Typography>
    </div>
  );
}

export default withTheme(TargetAccuracy);
