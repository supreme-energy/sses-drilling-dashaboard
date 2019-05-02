import React from "react";
import classes from "./styles.scss";
import { useWellInfo } from "../../api/index";
import { Typography } from "@material-ui/core";
import { withTheme } from "@material-ui/core/styles";

function InZoneAccuracy({ wellId, theme }) {
    const { zoneStatus } = useWellInfo(wellId);
    const color = theme.palette.success.main; // theme.palette.warning.main

    return (
      <div className={classes.zoneStatus}>
        <div className={classes.horizontalCenter}>
          <Typography variant="h5" style={{ color }}>
            {zoneStatus || ""}
          </Typography>
        </div>
        <Typography variant="caption" gutterBottom>
            In-Zone Accuracy
        </Typography>
      </div>
    );
}

export default withTheme()(InZoneAccuracy);
