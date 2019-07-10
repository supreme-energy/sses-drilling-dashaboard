import React from "react";
import Rop from "../ROP";
import classes from "./styles.scss";
import KPIGraphic from "../KPIGraphic";
import DrillPhaseKPI from "../../../../Kpi/DrillPhaseKPI";
import WellMapPlot from "../WellMapPlot";

export default function({ wellId }) {
  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <KPIGraphic className={classes.KPIGraphic} wellId={wellId} child={<Rop className={classes.ropChart} />} />
      </div>
      <div className={classes.right}>
        <DrillPhaseKPI wellId={wellId} />
        <div className={classes.toolFace} />
        <WellMapPlot className={classes.mapPlot} />
      </div>
    </div>
  );
}
