import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import classes from "./ComboDashboard.scss";

const CrossSectionDashboard = lazy(() =>
  import(/* webpackChunkName: 'CrossSectionDashboard' */ "./CrossSectionDashboard")
);

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <div className={classes.comboDashboardWrapper}>
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
