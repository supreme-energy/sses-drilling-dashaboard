import React from "react";
import PropTypes from "prop-types";

import WidgetCard from "../../../components/WidgetCard";
import { useWellOverviewKPI } from "../../../api";
import KpiItem from "../../Kpi/KpiItem";
import { PercentageBar, renderRotating, renderSliding, noDecimals } from "../../Kpi/DrillPhaseKPI/Kpi";
import classes from "./DrillingAnalytics.scss";

const SlidingKpi = ({ data }) => (
  <div className={classes.slidingKpiContainer}>
    <div className={classes.slidingKpis}>
      <KpiItem
        className={classes.slidingLabel}
        format={noDecimals}
        label={`Sliding ${noDecimals(data.slidingPct)}%`}
        value={data.avgSliding}
        renderValue={renderSliding}
        measureUnit={"fph"}
      />

      <KpiItem
        className={classes.rotatingLabel}
        format={noDecimals}
        label={`Rotating ${noDecimals(data.rotatingPct)}%`}
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
    <WidgetCard className={classes.phaseOverviewCard} title={`${drillPhaseType} Overview`} hideMenu>
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
