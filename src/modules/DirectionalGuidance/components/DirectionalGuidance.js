import React from "react";

import Projections from "./Projections";
import ToolFace from "./ToolFace/index";
import MotorYield from "./MotorYield";
import BottomHoleAssembly from "./BottomHoleAssembly";
import Measures from "../../ComboDashboard/components/Measures";
import WellBottomHoleInfo from "./WellBottomHoleInfo";
import { useWellIdContainer } from "../../App/Containers";
import classes from "./DirectionalGuidance.scss";

export function DirectionalGuidance() {
  const { wellId } = useWellIdContainer();
  return (
    <div className={classes.directionalGuidanceContainer}>
      <div className={classes.kpiRows}>
        <div className={classes.row}>
          <Projections wellId={wellId} />
          <BottomHoleAssembly />
          <MotorYield />
        </div>
        <div className={classes.graphRow}>
          <WellBottomHoleInfo />
        </div>
      </div>
      <div className={classes.toolFaceColumn}>
        <ToolFace />
      </div>
      <div className={classes.measuresColumn}>
        <Measures wellId={wellId} />
      </div>
    </div>
  );
}

export default DirectionalGuidance;
