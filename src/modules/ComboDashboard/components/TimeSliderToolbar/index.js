import React, { useReducer, useState } from "react";
import { Card, IconButton } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import TimeSlider from "./TimeSliderContainer";
import classes from "./TimeSliderToolbar.scss";
import { ON_SURFACE } from "../../../../constants/wellPathStatus";

function TimeSliderToolbar() {
  const [expanded, toggleExpanded] = useReducer(e => !e, true);
  const [drillPhase, setDrillPhase] = useState(ON_SURFACE);

  return (
    <Card className={classes.timeSliderToolbar}>
      <Card className={classes.collapseButtonContainer}>
        <IconButton className={classes.collapseButton} onClick={toggleExpanded}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Card>
      <div className={classes.expandContainer}>
        <DrillPhaseViewer
          className={classes.noShrink}
          expanded={expanded}
          drillPhase={drillPhase}
          setDrillPhase={setDrillPhase}
        />
        <TimeSlider drillPhase={drillPhase} expanded={expanded} />
      </div>
    </Card>
  );
}

TimeSliderToolbar.propTypes = {};

export default TimeSliderToolbar;
