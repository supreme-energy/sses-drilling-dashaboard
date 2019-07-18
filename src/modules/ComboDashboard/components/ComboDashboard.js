import React, { Suspense, lazy } from "react";
import classNames from "classnames";
import Progress from "@material-ui/core/CircularProgress";

import DrillPhaseKPI from "../../Kpi/DrillPhaseKPI";
import Interpretation from "../../Interpretation";

import ToolFace from "./ToolFace";
import AerialCrossSection from "./AerialCrossSection";
import WellOperation from "./WellOperation";
import CrossSectionDashboard from "./CrossSectionDashboard";
import classes from "./ComboDashboard.scss";
import { useWellIdContainer, CrossSectionProvider, SurveysProvider } from "../../App/Containers";
import { ComboContainerProvider } from "../containers/store";

const Measures = lazy(() => import(/* webpackChunkName: 'Measures' */ "./Measures"));

function ComboDashboard() {
  const { wellId } = useWellIdContainer();
  return (
    <SurveysProvider>
      <ComboContainerProvider>
        <div className={classes.comboDashboardWrapper}>
          <Suspense fallback={<Progress />}>
            <div className={classes.kpiRows}>
              <div className={classes.row}>
                <DrillPhaseKPI className={classes.drillPhaseKpi} wellId={wellId} />
                <ToolFace />
                <WellOperation wellId={wellId} />
                <AerialCrossSection wellId={wellId} />
              </div>
              <div className={classNames(classes.row, classes.graphRow)}>
                <Interpretation className={"flex"} />
                <CrossSectionProvider>
                  <CrossSectionDashboard wellId={wellId} className={"flex-3"} />
                </CrossSectionProvider>
              </div>
            </div>
            <div className={classes.kpiColumn}>
              <Measures wellId={wellId} />
            </div>
          </Suspense>
        </div>
      </ComboContainerProvider>
    </SurveysProvider>
  );
}

export default ComboDashboard;
