import React, { useState } from "react";
import { Card, IconButton } from "@material-ui/core";
import { ArrowDropDown, ArrowDropUp } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import TimeSlider from "./TimeSlider";
import classes from "./TimeSliderToolbar.scss";

function TimeSliderToolbar() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ display: "flex" }}>
      <Card className={classes.card}>
        <IconButton className={classes.collapseButton} onClick={() => setExpanded(e => !e)}>
          {expanded ? <ArrowDropDown /> : <ArrowDropUp />}
        </IconButton>
      </Card>
      <div className={expanded ? classes.expandedContainer : classes.collapsedContainer}>
        <DrillPhaseViewer className={classes.noShrink} expanded={expanded} />
        <TimeSlider className={classes.noShrink} expanded={expanded} />
      </div>
    </div>
  );
}

TimeSliderToolbar.propTypes = {};

export default TimeSliderToolbar;
