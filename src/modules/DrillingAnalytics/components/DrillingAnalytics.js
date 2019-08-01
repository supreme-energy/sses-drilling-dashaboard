import React from "react";
import classNames from "classnames";

import FootageZoneStats from "./FootageZoneStats";
import PhaseOverview from "./PhaseOverview";
import StandAnalysis from "./StandAnalysis";
import SlideAnalysis from "./SlideAnalysis";
import VerticalCrossSection from "./VerticalCrossSection/index";
import PerformanceAnalysis from "./PerformanceAnalysis";
import { useDrillPhaseContainer, useWellIdContainer } from "../../App/Containers";
import { LATERAL, CURVE, VERTICAL } from "../../../constants/wellSections";

import classes from "./DrillingAnalytics.scss";

export function DrillingAnalytics() {
  const {
    drillPhaseObj: { phase, inView }
  } = useDrillPhaseContainer();
  const { wellId } = useWellIdContainer();

  const drillPhaseType = phase === LATERAL || phase === CURVE ? phase : VERTICAL;
  const isVertical = drillPhaseType === VERTICAL;

  return (
    <div className={classes.drillingAnalyticsContainer}>
      <div className={classes.row}>
        <PhaseOverview wellId={wellId} drillPhase={phase} drillPhaseType={drillPhaseType} />
        <StandAnalysis wellId={wellId} drillPhase={phase} />
        <SlideAnalysis wellId={wellId} drillPhase={drillPhaseType} />
      </div>
      <div className={classNames(classes.row, classes.extendRow)}>
        <VerticalCrossSection
          className={classNames({ [classes.verticalView]: isVertical })}
          wellId={wellId}
          drillPhase={phase}
          inView={inView}
        />
        <PerformanceAnalysis drillPhase={drillPhaseType} />
        {isVertical && <FootageZoneStats drillPhase={drillPhaseType} />}
      </div>
    </div>
  );
}

export default DrillingAnalytics;
