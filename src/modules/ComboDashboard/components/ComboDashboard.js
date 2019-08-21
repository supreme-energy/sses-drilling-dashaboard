import React, { Suspense, lazy } from "react";
import classNames from "classnames";
import Progress from "@material-ui/core/CircularProgress";

import { useWellOverviewKPI } from "../../../api";
import Kpi from "../../Kpi/DrillPhaseKPI/Kpi";
import Interpretation from "../../Interpretation";

import ToolFace from "./ToolFace";
import AerialCrossSection from "./AerialCrossSection";
import WellOperation from "./WellOperation";
import CrossSectionDashboard from "./CrossSectionDashboard";
import classes from "./ComboDashboard.scss";
import { useWellIdContainer, useDrillPhaseContainer } from "../../App/Containers";
import { ALL } from "../../../constants/wellSections";

const Measures = lazy(() => import(/* webpackChunkName: 'Measures' */ "./Measures"));

function ComboDashboard() {
  const { wellId } = useWellIdContainer();
  const {
    drillPhaseObj: { phase }
  } = useDrillPhaseContainer();
  const { data } = useWellOverviewKPI(wellId);
  const kpiData = data.find(d => d.type === phase) || { type: ALL };

  return (
    <div className={classes.comboDashboardWrapper}>
      <Suspense fallback={<Progress />}>
        <div className={classes.kpiRows}>
          <div className={classes.row}>
            <Kpi className={classes.drillPhaseKpi} data={kpiData} />
            <ToolFace />
            <WellOperation wellId={wellId} />
            <AerialCrossSection wellId={wellId} />
          </div>
          <div className={classNames(classes.row, classes.graphRow)}>
            <Interpretation className={"flex"} />

            <CrossSectionDashboard wellId={wellId} className={"flex-3"} />
          </div>
        </div>
        <div className={classes.kpiColumn}>
          <Measures wellId={wellId} />
        </div>
      </Suspense>
    </div>
  );
}

export default ComboDashboard;
