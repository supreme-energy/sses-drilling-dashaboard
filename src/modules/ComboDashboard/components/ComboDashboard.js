import React, { Suspense, useEffect } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import { changeWellAccessTimestamp } from "../../WellExplorer/store";
import { connect } from "react-redux";

export const ComboDashboard = ({
  match: {
    params: { wellId }
  },
  changeWellAccessTimestamp
}) => {
  useEffect(
    function updateWellTimestamp() {
      if (wellId) {
        changeWellAccessTimestamp(wellId);
      }
    },
    [wellId]
  );
  return (
    <Suspense fallback={<Progress />}>
      <div style={{ margin: "0 auto" }}>
        <h2>ComboDashboard</h2>
      </div>
    </Suspense>
  );
};

ComboDashboard.propTypes = { match: PropTypes.object, changeWellAccessTimestamp: PropTypes.func };

const mapDispatchToProps = {
  changeWellAccessTimestamp
};

export default connect(
  null,
  mapDispatchToProps
)(ComboDashboard);
