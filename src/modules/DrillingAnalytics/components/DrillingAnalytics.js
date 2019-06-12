import React from "react";
import WidgetCard from "../../WidgetCard";
import { useWellOverviewKPI } from "../../../api";
import { useDrillPhaseContainer } from "../../App/Containers";
import { SlidingKpi } from "../../Kpi/DrillPhaseKPI/Kpi";
import { Typography } from "@material-ui/core";

export function DrillingAnalytics() {
  const {
    drillPhaseObj: { phase }
  } = useDrillPhaseContainer();

  const { data } = useWellOverviewKPI();
  const drillingPhase = data.find(d => !d.casingSize);

  const drillPhaseType = phase === "Lateral" || phase === "Curve" ? phase : "Vertical";
  return (
    <div>
      <WidgetCard>
        <Typography variant="subtitle1">{`${drillPhaseType} Overview`}</Typography>
        <SlidingKpi data={drillingPhase} />
      </WidgetCard>
    </div>
  );
}

DrillingAnalytics.propTypes = {};

export default DrillingAnalytics;
