import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import _ from "lodash";

import WidgetCard from "../../WidgetCard";
import { useWellOverviewKPI } from "../../../api";
import { SlidingKpi } from "../../Kpi/DrillPhaseKPI/Kpi";
import classes from "./DrillingAnalytics.scss";
import VerticalMenu from "../../VerticalMenu";

export function PhaseOverview({ wellId, drillPhase }) {
  const { data } = useWellOverviewKPI(wellId);
  const phaseData = data.find(d => d.type === drillPhase);

  return (
    <WidgetCard className={classes.phaseOverviewCard}>
      <Typography variant="subtitle1">{`${drillPhase} Overview`}</Typography>
      <VerticalMenu
        id="phase-overview-widget-menu"
        className={classes.verticalMenu}
        selectedMenuItems={[]}
        setSelectedMenuItem={_.noop}
        menuItemEnum={[]}
        multiSelect
      />
      <SlidingKpi data={phaseData} />
    </WidgetCard>
  );
}

PhaseOverview.propTypes = {
  wellId: PropTypes.string,
  drillPhase: PropTypes.string
};

export default PhaseOverview;
