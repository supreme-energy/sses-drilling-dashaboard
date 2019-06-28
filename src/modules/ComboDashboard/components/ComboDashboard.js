import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import DrillPhaseKPI from "../../Kpi/DrillPhaseKPI";
import Interpretation from "../../Interpretation";
import WellOperation from "./WellOperation";
import ToolFace from "./ToolFace";
import ArialCrossSection from "./ArialCrossSection";
import Measurements from "./Measurements";
import CrossSectionDashboard from "./CrossSectionDashboard";
import classes from "./ComboDashboard.scss";
import { ComboContainerProvider } from "../containers/store";

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <ComboContainerProvider>
      <div className={classes.comboDashboardWrapper}>
        <div className={classes.kpiRows}>
          <div className={classes.row}>
            <DrillPhaseKPI className={classes.drillPhaseKpi} />
            <ToolFace />
            <WellOperation />
            <ArialCrossSection />
          </div>
          <div className={classNames(classes.row, classes.graphRow)}>
            <Interpretation />
            <CrossSectionDashboard wellId={openedWellId} />
          </div>
        </div>
        <div className={classes.kpiColumn}>
          <Measurements />
        </div>
      </div>
    </ComboContainerProvider>
  );
}

ComboDashboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export default ComboDashboard;
