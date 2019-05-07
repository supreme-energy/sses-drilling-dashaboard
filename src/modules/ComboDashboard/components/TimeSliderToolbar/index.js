import React, { useReducer } from "react";
import { Card, IconButton } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import TimeSlider from "./TimeSlider";
import classes from "./TimeSliderToolbar.scss";

function TimeSliderToolbar() {
  const [expanded, toggleExpanded] = useReducer(e => !e, true);
  return (
    <div className={classes.timeSliderToolbar}>
      <Card className={classes.collapseButtonContainer}>
        <IconButton className={classes.collapseButton} onClick={toggleExpanded}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Card>
      <div className={classes.expandContainer}>
        <DrillPhaseViewer className={classes.noShrink} expanded={expanded} />
        <TimeSlider className={classes.noShrink} expanded={expanded} />
      </div>
    </div>
  );
}

TimeSliderToolbar.propTypes = {};

export default TimeSliderToolbar;
