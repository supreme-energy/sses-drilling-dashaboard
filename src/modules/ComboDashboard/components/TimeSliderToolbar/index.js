import React, { useState } from "react";
import { Card, IconButton } from "@material-ui/core";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

import DrillPhaseViewer from "./DrillPhaseViewer";
// import classes from "./TimeSliderToolbar.scss";

function TimeSliderToolbar() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ display: "flex" }}>
      <Card>
        <IconButton onClick={() => setExpanded(e => !e)}>
          <ArrowDropDown />
        </IconButton>
      </Card>
      <DrillPhaseViewer expanded={expanded} />
      {/* TODO: TimeSlider Goes Here */}
    </div>
  );
}

TimeSliderToolbar.propTypes = {};

export default TimeSliderToolbar;
