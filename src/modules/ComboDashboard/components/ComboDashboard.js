import React from "react";
import PropTypes from "prop-types";

import CrossSectionDashboard from "./CrossSectionDashboard";
import DrillPhaseViewer from "./DrillPhaseViewer";
import HeaderToolbar from "./HeaderToolbar";

function ComboDashboard({
  match: {
    params: { wellId: openedWellId }
  }
}) {
  return (
    <div>
      <HeaderToolbar wellId={openedWellId} />
      <DrillPhaseViewer />
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
