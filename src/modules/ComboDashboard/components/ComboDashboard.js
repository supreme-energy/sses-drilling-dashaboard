import React, { Suspense, lazy } from "react";
import classNames from "classnames";
import Progress from "@material-ui/core/CircularProgress";
import { useLocalStorageReducer } from "react-storage-hooks";

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
const defaultView = { x: 0, y: 0, xScale: 1, yScale: 1 };

function ComboDashboard() {
  const { wellId } = useWellIdContainer();
  const {
    drillPhaseObj: { phase }
  } = useDrillPhaseContainer();
  const { data } = useWellOverviewKPI(wellId);
  const kpiData = data.find(d => d.type === phase) || { type: ALL };

  const [view, updateView] = useLocalStorageReducer(
    `${wellId}ComboDashboard`,
    function(state, arg) {
      if (typeof arg === "function") {
        return { ...state, ...arg(state) };
      }
      return { ...state, ...arg };
    },
    defaultView
  );

  return (
    <div className={classes.comboDashboardWrapper}>
      <Suspense fallback={<Progress />}>
        <div className={classes.kpiRows}>
          <div className={classes.row}>
            <Kpi className={classes.drillPhaseKpi} data={kpiData} />
            <ToolFace wellId={wellId} />
            <WellOperation wellId={wellId} />
            <AerialCrossSection wellId={wellId} />
          </div>
          <div className={classNames(classes.row, classes.graphRow)}>
            <Interpretation className={"flex"} />

            <CrossSectionDashboard wellId={wellId} className={"flex-3"} view={view} updateView={updateView} />
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
