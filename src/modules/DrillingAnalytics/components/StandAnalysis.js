import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import { useWellOverviewKPI } from "../../../api";
import WidgetCard from "../../WidgetCard";
import VerticalMenu from "../../VerticalMenu";
import KpiItem from "../../Kpi/KpiItem";
import classes from "./DrillingAnalytics.scss";

export const formatStand = value => `#${value}`;
export function StandAnalysis({ drillPhase }) {
  const { data } = useWellOverviewKPI();
  const filteredData = data.filter(d => d.type === drillPhase);
  const phaseData = filteredData[0] || {};

  return (
    <WidgetCard className={classes.standAnalysisCard}>
      <Typography variant="subtitle1">Stand Analysis</Typography>
      <VerticalMenu
        id="stand-analysis-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
      <div className={classes.kpiContainer}>
        <KpiItem className={classes.kpi} label="Stand" value={0} format={formatStand} />
        <KpiItem className={classes.kpi} label="Footage Range" value={0} measureUnit="ft" />
        <KpiItem className={classes.kpi} label="Average Rate of Penetration" value={phaseData.rop} measureUnit="fph" />
      </div>
    </WidgetCard>
  );
}

StandAnalysis.propTypes = {
  drillPhase: PropTypes.string
};

export default StandAnalysis;
