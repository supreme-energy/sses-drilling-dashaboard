import React from "react";

import BottomHoleAssembly from "./BottomHoleAssembly";
import Measures from "../../ComboDashboard/components/Measures";
import WellBottomHoleInfo from "./WellBottomHoleInfo";
import WidgetCard from "../../../components/WidgetCard";
import classes from "./DirectionalGuidance.scss";
import { useWellIdContainer } from "../../App/Containers";

export function DirectionalGuidance() {
  const { wellId } = useWellIdContainer();
  return (
    <div className={classes.directionalGuidanceContainer}>
      <div className={classes.kpiRows}>
        <div className={classes.row}>
          <WidgetCard title="Projection" hideMenu />
          <BottomHoleAssembly />
          <WidgetCard title="Motor Yield" hideMenu />
        </div>
        <div className={classes.graphRow}>
          <WellBottomHoleInfo />
        </div>
      </div>
      <div className={classes.toolFaceColumn}>
        <WidgetCard title="Tool Face" hideMenu />
      </div>
      <div className={classes.measuresColumn}>
        <Measures wellId={wellId} />
      </div>
    </div>
  );
}

export default DirectionalGuidance;
