import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import FootageZoneStats from "./FootageZoneStats";
import PhaseOverview from "./PhaseOverview";
import StandAnalysis from "./StandAnalysis";
import SlideAnalysis from "./SlideAnalysis";
import VerticalCrossSection from "./VerticalCrossSection";
import PerformanceAnalysis from "./PerformanceAnalysis";
import { useDrillPhaseContainer } from "../../App/Containers";
import { LATERAL, CURVE, VERTICAL } from "../../../constants/wellSections";

import classes from "./DrillingAnalytics.scss";

export function DrillingAnalytics({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  const {
    drillPhaseObj: { phase }
  } = useDrillPhaseContainer();

  const drillPhaseType = phase === LATERAL || phase === CURVE ? phase : VERTICAL;

  return (
    <div className={classes.drillingAnalyticsContainer}>
      <div className={classes.row}>
        <PhaseOverview wellId={openedWellId} drillPhase={phase} drillPhaseType={drillPhaseType} />
        <StandAnalysis wellId={openedWellId} drillPhase={phase} />
        <SlideAnalysis drillPhase={drillPhaseType} />
      </div>
      <div className={classNames(classes.row, classes.extendRow)}>
        <VerticalCrossSection drillPhase={drillPhaseType} />
        <PerformanceAnalysis drillPhase={drillPhaseType} />
        {drillPhaseType === VERTICAL && <FootageZoneStats drillPhase={drillPhaseType} />}
      </div>
    </div>
  );
}

DrillingAnalytics.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export default DrillingAnalytics;
