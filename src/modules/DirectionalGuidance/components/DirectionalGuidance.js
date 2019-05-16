import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";

const HeaderToolbar = lazy(() =>
  import(/* webpackChunkName: 'HeaderToolbar' */ "../../ComboDashboard/components/HeaderToolbar")
);
const TimeSliderToolbar = lazy(() =>
  import(/* webpackChunkName: 'TimeSliderToolbar' */ "../../ComboDashboard/components/TimeSliderToolbar")
);

export const DirectionalGuidance = ({
  match: {
    params: { wellId: openedWellId }
  }
}) => (
  <div>
    <Suspense fallback={<Progress />}>
      <HeaderToolbar wellId={openedWellId} />
    </Suspense>
    <Suspense fallback={<Progress />}>
      <TimeSliderToolbar />
    </Suspense>
    <h2>Directional Guidance</h2>
  </div>
);

DirectionalGuidance.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      wellId: PropTypes.string
    })
  })
};

export default DirectionalGuidance;
