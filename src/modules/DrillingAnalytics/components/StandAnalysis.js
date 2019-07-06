import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import { useWellOverviewKPI } from "../../../api";
import WidgetCard from "../../WidgetCard";
import KpiItem from "../../Kpi/KpiItem";
import classes from "./DrillingAnalytics.scss";

export const formatStand = value => `#${value}`;
export function StandAnalysis({ wellId, drillPhase }) {
  const { data } = useWellOverviewKPI(wellId);
  const filteredData = data.filter(d => d.type === drillPhase);
  const phaseData = filteredData[0] || {};

  return (
    <WidgetCard className={classes.standAnalysisCard} hideMenu>
      <Typography variant="subtitle1">Stand Analysis</Typography>
      <div className={classes.kpiContainer}>
        <KpiItem className={classes.kpi} label="Stand" value={0} format={formatStand} />
        <KpiItem className={classes.kpi} label="Footage Range" value={0} measureUnit="ft" />
        <KpiItem className={classes.kpi} label="Average Rate of Penetration" value={phaseData.rop} measureUnit="fph" />
      </div>
    </WidgetCard>
  );
}

StandAnalysis.propTypes = {
  wellId: PropTypes.string,
  drillPhase: PropTypes.string
};

export default StandAnalysis;
