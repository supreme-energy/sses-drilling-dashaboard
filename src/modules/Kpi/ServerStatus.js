import React from "react";
import classes from "./styles.scss";
import Cloud from "@material-ui/icons/Cloud";
import File from "@material-ui/icons/FileCopy";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import { withTheme } from "@material-ui/core/styles";
import KpiItem from "./KpiItem";
import { noDecimals } from "./DrillPhaseKPI/Kpi";
import { ONLINE, OFFLINE } from "../../constants/serverStatus";
import { useCloudServerCountdownContainer } from "../App/Containers";
import { useWellInfo, useCloudServer } from "../../api/index";

const icons = {
  [ONLINE]: Cloud,
  [OFFLINE]: File
};

function ServerStatus({ wellId, theme }) {
  const [{ serverStatus }] = useWellInfo(wellId);
  const {
    data: { next_survey: newSurvey, cmes }
  } = useCloudServer(wellId);
  const { countdown } = useCloudServerCountdownContainer();
  const isOnline = serverStatus === ONLINE;

  const hasConflict = !!cmes;
  const hasUpdate = hasConflict || newSurvey;

  const Icon = icons[serverStatus || OFFLINE];
  const color = isOnline ? theme.palette.success.main : theme.palette.gray.main;

  return (
    <div className={classes.serverStatus}>
      <div className={classes.horizontalCenter}>
        <Badge
          className={hasConflict ? classes.badgeRed : classes.badgeGreen}
          variant="dot"
          invisible={!hasUpdate && !isOnline}
          color="secondary"
        >
          <Icon style={{ fill: color }} />
        </Badge>
        <span className={classes.spacer} />
        <Typography variant="h5" style={{ color }}>
          {!isOnline ? (
            "File"
          ) : hasUpdate ? (
            "Update"
          ) : (
            <KpiItem className={classes.slidingLabel} format={noDecimals} value={countdown} measureUnit="sec" />
          )}
        </Typography>
      </div>
      <Typography className={classes.italicLabel} variant="caption" gutterBottom>
        Data Server
      </Typography>
    </div>
  );
}

export default withTheme(ServerStatus);
