import React from "react";

import CrossSectionDashboard from "./CrossSectionDashboard";
import DrillPhaseViewer from "./DrillPhaseViewer";

function ComboDashboard() {
  return (
    <div>
      <DrillPhaseViewer />
      <CrossSectionDashboard />
    </div>
  );
}

export default ComboDashboard;
