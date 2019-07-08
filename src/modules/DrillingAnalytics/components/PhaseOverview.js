import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";

import WidgetCard from "../../WidgetCard";
import { useWellOverviewKPI } from "../../../api";
import KpiItem from "../../Kpi/KpiItem";
import { PercentageBar, renderRotating, renderSliding, percentage } from "../../Kpi/DrillPhaseKPI/Kpi";
import { noDecimals } from "../../../constants/format";
import classes from "./DrillingAnalytics.scss";

const SlidingKpi = ({ data }) => (
  <div className={classes.slidingKpiContainer}>
    <div className={classes.slidingKpis}>
      <KpiItem
        className={classes.slidingLabel}
        format={noDecimals}
        label={`Sliding ${percentage(data.slidingPct)}`}
        value={data.avgSliding}
        renderValue={renderSliding}
        measureUnit={"fph"}
      />

      <KpiItem
        className={classes.rotatingLabel}
        format={noDecimals}
        label={`Rotating ${percentage(data.rotatingPct)}`}
        value={data.avgRotating}
        renderValue={renderRotating}
        measureUnit={"fph"}
      />
    </div>
    <PercentageBar
      values={[
        { value: data.slidingPct, color: "#AFB42B", id: "slidingPct" },
        { value: data.rotatingPct, color: "#827717", id: "rotatingPct" }
      ]}
      height={8}
    />
  </div>
);

SlidingKpi.defaultProps = {
  data: {}
};

export function PhaseOverview({ wellId, drillPhase, drillPhaseType }) {
  const { data } = useWellOverviewKPI(wellId);
  const phaseData = data.find(d => d.type === drillPhase);

  return (
    <WidgetCard className={classes.phaseOverviewCard} hideMenu>
      <Typography variant="subtitle1">{`${drillPhaseType} Overview`}</Typography>
      <SlidingKpi data={phaseData} />
    </WidgetCard>
  );
}

PhaseOverview.propTypes = {
  wellId: PropTypes.string,
  drillPhase: PropTypes.string,
  drillPhaseType: PropTypes.string
};

export default PhaseOverview;
