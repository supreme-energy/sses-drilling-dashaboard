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
import { AUTO_IMPORT_ON, AUTO_IMPORT_OFF, MANUAL_IMPORT } from "../../constants/serverStatus";
import { PULL } from "../../constants/interpretation";
import { useCloudServerCountdownContainer, useSelectedWellInfoContainer } from "../App/Containers";
import { useCloudServer } from "../../api/index";

const icons = {
  [AUTO_IMPORT_ON]: Cloud,
  [AUTO_IMPORT_OFF]: CloudOff,
  [MANUAL_IMPORT]: File
};

function ServerStatus({ wellId, theme }) {
  const [{ isCloudServerEnabled, wellInfo }] = useSelectedWellInfoContainer(wellId);
  const {
    data: { next_survey: newSurvey, cmes }
  } = useCloudServer(wellId);
  const { countdown } = useCloudServerCountdownContainer();

  const hasConflict = !!cmes;
  const hasUpdate = hasConflict || newSurvey;
  const canAutoImport = wellInfo && wellInfo[PULL];
  const isAutoImporting = canAutoImport && isCloudServerEnabled;
  const iconState =
    canAutoImport && isCloudServerEnabled ? AUTO_IMPORT_ON : isCloudServerEnabled ? AUTO_IMPORT_OFF : MANUAL_IMPORT;
  const Icon = icons[iconState];
  const color = isAutoImporting || hasUpdate ? theme.palette.success.main : theme.palette.gray.main;

  return (
    <div className={classes.serverStatus}>
      <div className={classes.horizontalCenter}>
        <Badge
          className={hasConflict ? classes.badgeRed : classes.badgeGreen}
          variant="dot"
          invisible={!hasUpdate || !isCloudServerEnabled}
          color="secondary"
        >
          <Icon style={{ fill: color }} />
        </Badge>
        <span className={classes.spacer} />
        <Typography variant="h5" style={{ color }}>
          {!isCloudServerEnabled ? (
            "File"
          ) : hasUpdate ? (
            "Update"
          ) : isAutoImporting ? (
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
