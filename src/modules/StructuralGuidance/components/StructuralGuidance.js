import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";

const HeaderToolbar = lazy(() =>
  import(/* webpackChunkName: 'HeaderToolbar' */ "../../ComboDashboard/components/HeaderToolbar")
);
const TimeSliderToolbar = lazy(() =>
  import(/* webpackChunkName: 'TimeSliderToolbar' */ "../../ComboDashboard/components/TimeSliderToolbar")
);

export const StructuralGuidance = ({
  match: {
    params: { wellId: openedWellId }
  }
}) => (
  <div style={{ margin: "0 auto" }}>
    <Suspense fallback={<Progress />}>
      <HeaderToolbar wellId={openedWellId} />
    </Suspense>
    <Suspense fallback={<Progress />}>
      <TimeSliderToolbar />
    </Suspense>
    <h2>Structural Guidance</h2>
  </div>
);

StructuralGuidance.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export default StructuralGuidance;
