import React from "react";
import { Typography } from "@material-ui/core";
import { withTheme } from "@material-ui/core/styles";

import { useWellInfo } from "../../api/index";
import classes from "./styles.scss";

// TODO: GET data from ASTRA to populate InZoneAccuracy
// Once data type is known, this component MAY use the form
// of KpiItem in KpiItem.js
function InZoneAccuracy({ wellId, theme }) {
    const { zoneStatus } = useWellInfo(wellId);
    const color = zoneStatus ? theme.palette.success.main : theme.palette.warning.main;

    return (
      <div className={classes.zoneStatus}>
        <div className={classes.horizontalCenter}>
          <Typography variant="h5" style={{ color }}>
            {zoneStatus || "In Zone"}
          </Typography>
        </div>
        <Typography style={{ fontStyle: "italic" }} variant="caption" gutterBottom>
            Target Accuracy
        </Typography>
      </div>
    );
}

export default withTheme()(InZoneAccuracy);
