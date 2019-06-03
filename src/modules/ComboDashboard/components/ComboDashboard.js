import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import classes from "./ComboDashboard.scss";

const CrossSectionDashboard = lazy(() =>
  import(/* webpackChunkName: 'CrossSectionDashboard' */ "./CrossSectionDashboard")
);
const HeaderToolbar = lazy(() => import(/* webpackChunkName: 'HeaderToolbar' */ "./HeaderToolbar"));
const TimeSliderToolbar = lazy(() => import(/* webpackChunkName: 'TimeSliderToolbar' */ "./TimeSliderToolbar"));

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <div className={classes.comboDashboardWrapper}>
      <Suspense fallback={<Progress />}>
        <HeaderToolbar wellId={openedWellId} />
      </Suspense>
      <Suspense fallback={<Progress />}>
        <TimeSliderToolbar wellId={openedWellId} />
      </Suspense>
      <Suspense fallback={<Progress />}>
        <CrossSectionDashboard wellId={openedWellId} />
      </Suspense>
    </div>
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
