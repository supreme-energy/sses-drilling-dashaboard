import React from "react";
import classes from "./styles.scss";
import { ONLINE, OFFLINE } from "../../constants/serverStatus";
import Cloud from "@material-ui/icons/Cloud";
import CloudOff from "@material-ui/icons/CloudOff";
import { useWellInfo } from "../../api/index";
import { Typography } from "@material-ui/core";
import { withTheme } from "@material-ui/core/styles";

const icons = {
  [ONLINE]: Cloud,
  [OFFLINE]: CloudOff
};

function ServerStatus({ wellId, theme }) {
  const { serverStatus } = useWellInfo(wellId);
  const Icon = icons[serverStatus];
  const color = serverStatus === ONLINE ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <div className={classes.serverStatus}>
      <div className={classes.horizontalCenter}>
        <Icon style={{ fill: color }} />
        <span className={classes.spacer} />
        <Typography variant="h5" style={{ color }}>
          {serverStatus || ""}
        </Typography>
      </div>
      <Typography className={classes.italicLabel} variant="caption" gutterBottom>
        Data Server
      </Typography>
    </div>
  );
}

export default withTheme()(ServerStatus);
