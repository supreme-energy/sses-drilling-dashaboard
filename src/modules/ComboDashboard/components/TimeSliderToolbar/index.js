import React, { useState } from "react";
import { Card, IconButton, Collapse } from "@material-ui/core";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

import DrillPhaseViewer from "./DrillPhaseViewer";
import TimeSlider from "./TimeSlider";
import classes from "./TimeSliderToolbar.scss";

function TimeSliderToolbar() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ display: "flex" }}>
      <Card className={classes.card}>
        <IconButton className={classes.collapseButton} onClick={() => setExpanded(e => !e)}>
          <ArrowDropDown />
        </IconButton>
      </Card>
      <Collapse in={expanded}>
        <span style={{ display: "flex" }}>
          <DrillPhaseViewer className={classes.noShrink} expanded={expanded} />
          <TimeSlider className={classes.noShrink} />
        </span>
      </Collapse>
    </div>
  );
}

TimeSliderToolbar.propTypes = {};

export default TimeSliderToolbar;
