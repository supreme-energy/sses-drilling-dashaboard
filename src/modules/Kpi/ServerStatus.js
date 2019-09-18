import React from "react";
import classes from "./styles.scss";
import Cloud from "@material-ui/icons/Cloud";
import CloudOff from "@material-ui/icons/CloudOff";
import File from "@material-ui/icons/FileCopy";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import { withTheme } from "@material-ui/core/styles";
import KpiItem from "./KpiItem";
import { noDecimals } from "./DrillPhaseKPI/Kpi";
import { ONLINE, OFFLINE, MANUAL } from "../../constants/serverStatus";
import { PULL } from "../../constants/interpretation";
import { useCloudServerCountdownContainer, useSelectedWellInfoContainer } from "../App/Containers";
import { useCloudServer } from "../../api/index";

const icons = {
  [ONLINE]: Cloud,
  [OFFLINE]: CloudOff,
  [MANUAL]: File
};

function ServerStatus({ wellId, theme }) {
  const [{ serverStatus, online, wellInfo }] = useSelectedWellInfoContainer(wellId);
  const {
    data: { next_survey: newSurvey, cmes }
  } = useCloudServer(wellId);
  const { countdown } = useCloudServerCountdownContainer();

  const hasConflict = !!cmes;
  const isOnline = !!online;
  const hasUpdate = hasConflict || newSurvey;
  const isAutoImportEnabled = wellInfo && wellInfo[PULL];

  const Icon = icons[serverStatus || OFFLINE];
  const color = isOnline && (isAutoImportEnabled || hasUpdate) ? theme.palette.success.main : theme.palette.gray.main;

  console.log("isOnlein", online);
  return (
    <div className={classes.serverStatus}>
      <div className={classes.horizontalCenter}>
        <Badge
          className={hasConflict ? classes.badgeRed : classes.badgeGreen}
          variant="dot"
          invisible={!hasUpdate || !isOnline}
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
          ) : isAutoImportEnabled ? (
            <KpiItem className={classes.slidingLabel} format={noDecimals} value={countdown} measureUnit="sec" />
          ) : (
            "Off"
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
