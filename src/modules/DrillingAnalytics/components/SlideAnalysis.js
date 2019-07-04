import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../WidgetCard";
import KpiItem from "../../Kpi/KpiItem";
import { useWellOverviewKPI } from "../../../api";
import { formatStand } from "./StandAnalysis";
import { CURVE } from "../../../constants/wellSections";
import classes from "./DrillingAnalytics.scss";

export function SlideAnalysis({ drillPhase }) {
  const isRotation = drillPhase === CURVE ? "/ Rotation" : "";
  const { data } = useWellOverviewKPI();
  const filteredData = data.filter(d => d.type === drillPhase);
  const phaseData = filteredData[0] || {};
  return (
    <WidgetCard className={classes.slideAnalysisCard} hideMenu>
      <Typography variant="subtitle1">{`Slide ${isRotation} Analysis`}</Typography>
      <div className={classes.kpiContainer}>
        <KpiItem className={classes.kpi} label="Slide or Rotation" value={0} format={formatStand} />
        <KpiItem className={classes.kpi} label="Footage Range" value={0} measureUnit="ft" />
        <KpiItem className={classes.kpi} label="Average Rate of Penetration" value={phaseData.rop} measureUnit="fph" />
      </div>
    </WidgetCard>
  );
}

SlideAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default SlideAnalysis;
