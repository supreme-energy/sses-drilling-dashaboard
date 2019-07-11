import React from "react";
import classNames from "classnames";
import { Typography } from "@material-ui/core";

import Measures from "../../ComboDashboard/components/Measures";
import WidgetCard from "../../WidgetCard";
import classes from "./DirectionalGuidance.scss";
import { useWellIdContainer } from "../../App/Containers";

export function DirectionalGuidance() {
  const { wellId } = useWellIdContainer();
  return (
    <div className={classes.directionalGuidanceContainer}>
      <div className={classes.kpiRows}>
        <div className={classes.row}>
          <WidgetCard hideMenu>
            <Typography variant="subtitle1">Projection</Typography>
          </WidgetCard>
          <WidgetCard hideMenu>
            <Typography variant="subtitle1">Bottom Hole Assembly Tendency</Typography>
          </WidgetCard>
          <WidgetCard hideMenu>
            <Typography variant="subtitle1">Motor Yield</Typography>
          </WidgetCard>
        </div>
        <div className={classNames(classes.row, classes.graphRow)}>
          <WidgetCard hideMenu>
            <Typography variant="subtitle1">Well and Bottom Hole Assembly Information</Typography>
          </WidgetCard>
        </div>
      </div>
      <div className={classes.toolFaceColumn}>
        <WidgetCard hideMenu>
          <Typography variant="subtitle1">Tool Face</Typography>
        </WidgetCard>
      </div>
      <div className={classes.measuresColumn}>
        <Measures wellId={wellId} />
      </div>
    </div>
  );
}

export default DirectionalGuidance;
