import React from "react";
import PropTypes from "prop-types";

import CrossSectionDashboard from "./CrossSectionDashboard";
import HeaderToolbar from "./HeaderToolbar";
import TimeSliderToolbar from "./TimeSliderToolbar";

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <div>
      <HeaderToolbar wellId={openedWellId} />
      <TimeSliderToolbar />
      <CrossSectionDashboard wellId={openedWellId} />
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
